from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
import docker
import tempfile
import os
import subprocess
import json
from datetime import datetime

from ....core.database import get_db
from ....models.user import User
from ....core.security import get_current_user, get_optional_user

router = APIRouter()

# Initialize Docker client
try:
    docker_client = docker.from_env()
except Exception:
    docker_client = None

# Supported languages and their configurations
SUPPORTED_LANGUAGES = {
    "python": {
        "image": "python:3.11-slim",
        "extension": ".py",
        "run_command": ["python", "code.py"],
        "timeout": 10
    },
    "javascript": {
        "image": "node:18-slim",
        "extension": ".js",
        "run_command": ["node", "code.js"],
        "timeout": 10
    },
    "java": {
        "image": "openjdk:17-slim",
        "extension": ".java",
        "run_command": ["java", "Main"],
        "timeout": 15,
        "compile_command": ["javac", "Main.java"]
    },
    "cpp": {
        "image": "gcc:11",
        "extension": ".cpp",
        "run_command": ["./a.out"],
        "timeout": 15,
        "compile_command": ["g++", "-o", "a.out", "code.cpp"]
    }
}

class CodeExecutionRequest:
    def __init__(self, code: str, language: str, input_data: Optional[str] = None):
        self.code = code
        self.language = language
        self.input_data = input_data

@router.post("/execute")
async def execute_code(
    request: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Execute code in a safe environment"""
    code = request.get("code", "")
    language = request.get("language", "python").lower()
    input_data = request.get("input_data", "")
    
    if not code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")
    
    if language not in SUPPORTED_LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Language {language} is not supported")
    
    if not docker_client:
        # Allow a limited local fallback for Python when Docker isn't available
        if language == "python":
            try:
                result = await execute_python_locally(code, input_data)
                return {
                    "success": True,
                    "output": result["output"],
                    "error": result.get("error"),
                    "execution_time": result.get("execution_time"),
                    "memory_used": result.get("memory_used")
                }
            except Exception as e:
                raise HTTPException(status_code=503, detail=f"Code execution service is not available: {str(e)}")
        raise HTTPException(status_code=503, detail="Code execution service is not available")
    
    try:
        result = await execute_code_safely(code, language, input_data)
        return {
            "success": True,
            "output": result["output"],
            "error": result.get("error"),
            "execution_time": result.get("execution_time"),
            "memory_used": result.get("memory_used")
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "output": ""
        }

async def execute_code_safely(code: str, language: str, input_data: str = "") -> Dict[str, Any]:
    
    lang_config = SUPPORTED_LANGUAGES[language]
    
    # Create temporary directory for code
    with tempfile.TemporaryDirectory() as temp_dir:
        # Write code to file
        code_file = os.path.join(temp_dir, f"code{lang_config['extension']}")
        with open(code_file, 'w') as f:
            f.write(code)
        
        # Create Docker container
        container = docker_client.containers.run(
            lang_config["image"],
            command=["sleep", "30"],  # Keep container alive
            detach=True,
            mem_limit="100m",  # 100MB memory limit
            cpu_period=100000,
            cpu_quota=25000,  # 25% CPU limit
            network_disabled=True,  # Disable network access
            read_only=False,  # Allow writing to mounted volume
            volumes={
                temp_dir: {
                    'bind': '/workspace',
                    'mode': 'rw'
                }
            },
            working_dir='/workspace'
        )
        
        try:
            # Compile if needed
            if "compile_command" in lang_config:
                compile_result = container.exec_run(lang_config["compile_command"])
                if compile_result.exit_code != 0:
                    return {
                        "output": "",
                        "error": compile_result.output.decode('utf-8'),
                        "execution_time": 0
                    }
            
            # Execute code with proper input handling
            start_time = datetime.now()
            
            # For Python, ensure we capture both stdout and stderr
            if language == "python":
                # Create a wrapper script to handle input properly
                wrapper_script = f"""import sys
import io
import contextlib

# Redirect stdout and stderr to capture output
stdout_capture = io.StringIO()
stderr_capture = io.StringIO()

with contextlib.redirect_stdout(stdout_capture), contextlib.redirect_stderr(stderr_capture):
    try:
        # Execute the user code
        exec(open('code.py').read())
    except Exception as e:
        print(f"Error: {{e}}", file=sys.stderr)

# Get captured output
stdout_output = stdout_capture.getvalue()
stderr_output = stderr_capture.getvalue()

# Print output to actual stdout/stderr for container capture
if stdout_output:
    print(stdout_output, end='')
if stderr_output:
    print(stderr_output, end='', file=sys.stderr)
"""
                
                wrapper_file = os.path.join(temp_dir, "wrapper.py")
                with open(wrapper_file, 'w') as f:
                    f.write(wrapper_script)
                
                exec_result = container.exec_run(
                    ["python", "wrapper.py"],
                    input=input_data.encode() if input_data else None
                )
            else:
                # For other languages, use the standard approach
                exec_result = container.exec_run(
                    lang_config["run_command"],
                    input=input_data.encode() if input_data else None
                )
            
            execution_time = (datetime.now() - start_time).total_seconds()
            
            output = exec_result.output.decode('utf-8')
            error = None
            
            if exec_result.exit_code != 0:
                error = output
                output = ""
            
            # For Python, ensure we show the actual output even if there are warnings
            if language == "python" and output.strip():
                # Filter out common Python warnings that might interfere with output
                lines = output.split('\n')
                filtered_lines = []
                for line in lines:
                    if not any(warning in line.lower() for warning in [
                        'deprecation', 'warning', 'future', 'import', 'urllib'
                    ]):
                        filtered_lines.append(line)
                output = '\n'.join(filtered_lines).strip()
            
            return {
                "output": output,
                "error": error,
                "execution_time": execution_time,
                "memory_used": "N/A"  # Could be enhanced with container stats
            }
            
        finally:
            # Clean up container
            container.stop()
            container.remove()

@router.get("/languages")
async def get_supported_languages():
    """Get list of supported programming languages"""
    return {
        "languages": list(SUPPORTED_LANGUAGES.keys()),
        "details": SUPPORTED_LANGUAGES
    }

@router.post("/save")
async def save_code(
    request: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Save user's code (placeholder for future implementation)"""
    # This would save code to user's workspace
    # For now, just return success
    return {
        "success": True,
        "message": "Code saved successfully",
        "saved_at": datetime.now().isoformat()
    }

@router.get("/templates/{language}")
async def get_code_templates(language: str):
    """Get starter templates for different languages"""
    templates = {
        "python": {
            "name": "Hello World",
            "code": '''print("Hello, World!")

# Your code here
name = input("Enter your name: ")
print(f"Hello, {name}!")

# Demonstrate some output
numbers = [1, 2, 3, 4, 5]
print("Numbers:", numbers)
print("Sum:", sum(numbers))

# Show current time
from datetime import datetime
now = datetime.now()
print(f"Current time: {now.strftime('%H:%M:%S')}")'''
        },
        "javascript": {
            "name": "Hello World",
            "code": '''console.log("Hello, World!");

// Your code here
const name = prompt("Enter your name:");
console.log(`Hello, ${name}!`);'''
        },
        "java": {
            "name": "Hello World",
            "code": '''public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Your code here
        java.util.Scanner scanner = new java.util.Scanner(System.in);
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        System.out.println("Hello, " + name + "!");
    }
}'''
        },
        "cpp": {
            "name": "Hello World",
            "code": '''#include <iostream>
#include <string>

int main() {
    std::cout << "Hello, World!" << std::endl;
    
    // Your code here
    std::string name;
    std::cout << "Enter your name: ";
    std::getline(std::cin, name);
    std::cout << "Hello, " << name << "!" << std::endl;
    
    return 0;
}'''
        }
    }
    
    return templates.get(language.lower(), {"name": "Empty", "code": ""})


async def execute_python_locally(code: str, input_data: str = "") -> Dict[str, Any]:
    """Very limited local Python execution fallback without Docker (for dev only)."""
    with tempfile.TemporaryDirectory() as temp_dir:
        code_file = os.path.join(temp_dir, "code.py")
        with open(code_file, 'w') as f:
            f.write(code)

        start_time = datetime.now()
        try:
            proc = subprocess.run(
                ["/usr/bin/env", "python3", code_file],
                input=input_data.encode() if input_data else None,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=10,
                cwd=temp_dir,
                check=False
            )
            execution_time = (datetime.now() - start_time).total_seconds()
            
            if proc.returncode == 0:
                output = proc.stdout.decode('utf-8')
                # Filter out common Python warnings
                if output.strip():
                    lines = output.split('\n')
                    filtered_lines = []
                    for line in lines:
                        if not any(warning in line.lower() for warning in [
                            'deprecation', 'warning', 'future', 'import', 'urllib'
                        ]):
                            filtered_lines.append(line)
                    output = '\n'.join(filtered_lines).strip()
                
                return {
                    "output": output,
                    "error": None,
                    "execution_time": execution_time,
                    "memory_used": "N/A"
                }
            else:
                return {
                    "output": "",
                    "error": proc.stderr.decode('utf-8') or proc.stdout.decode('utf-8') or "Execution failed",
                    "execution_time": execution_time,
                    "memory_used": "N/A"
                }
        except subprocess.TimeoutExpired:
            return {
                "output": "",
                "error": "Execution timed out",
                "execution_time": 10,
                "memory_used": "N/A"
            }
