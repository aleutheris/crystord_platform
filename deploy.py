#!/usr/bin/env python3
import argparse
import subprocess
from datetime import datetime

# SERVER_ADDRESS = "nucubuntunl"
SERVER_ADDRESS = "aleuhouse"
SERVER_PORT_OUT = "4201"
SERVER_PORT_IN = "4201"
SERVER_HOME = "/home/ample/http/crystord_web_src"
LOCAL_HOME_DIR = "/home/ample"
SERVER_HOME_DIR = "/home/aleutheris"
APP_DIR = "/app"
PRESERVED_FOLDER = "/node_modules"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"
PROJECT_NAME = "crystord_web"
TAG = PROJECT_NAME + ":latest"
DOCKER_NETWORK = "crystord_net"


def run_command(command):
    print(f"Running command: {' '.join(command)}")
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    while True:
        stdout_line = process.stdout.readline()
        stderr_line = process.stderr.readline()

        if stdout_line == '' and stderr_line == '' and process.poll() is not None:
            break

        if stdout_line:
            print(f"STDOUT: {stdout_line.strip()}")

        if stderr_line:
            print(f"STDERR: {stderr_line.strip()}")

    # Wait for the process to complete
    process.wait()

    if process.returncode != 0:
        print(f"Command failed with return code {process.returncode}")

    print("\n")


def get_container_ids_by_tag(tag, server_address=None):
    if server_address:
        command = ["ssh", server_address, "docker", "ps", "-a", "--filter", f"ancestor={tag}", "--format", "{{.ID}}"]
    else:
        command = ["docker", "ps", "-a", "--filter", f"ancestor={tag}", "--format", "{{.ID}}"]

    try:
        result = subprocess.run(
            command, capture_output=True, text=True, check=True
        )

        container_ids = result.stdout.strip().split('\n')
        return container_ids

    except subprocess.CalledProcessError as e:
        print("Error running docker command:", e)
        return []


def get_image_ids_by_tag(tag, server_address=None):
    if server_address:
        command = ["ssh", server_address, "docker", "images", tag, "-q"]
    else:
        command = ["docker", "images", tag, "-q"]

    try:
        result = subprocess.run(
            command, capture_output=True, text=True, check=True
        )

        image_ids = result.stdout.strip().split('\n')
        return image_ids

    except subprocess.CalledProcessError as e:
        print("Error running docker command:", e)
        return []


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("-c", "--container", action="store_false", dest="silent", help="Disable standard output")
    args = parser.parse_args()

    run_command(["cp", "src/proxy.conf.server.json", "src/proxy.conf.json"])

    # run_command(["rsync", "-avz", "--exclude-from", ".rsyncignore", "--delete", "--chmod=D775,F775", "-e", "ssh", "src/", SERVER_ADDRESS + ":" + SERVER_HOME + "/"])
    run_command(["rsync", "-avz", "-e", "ssh", "./docker-compose.yml", SERVER_ADDRESS + ":~/containers/" + PROJECT_NAME + "/"])

    if not args.silent:
        print("Deploying the container...")

        local_container_ids = get_container_ids_by_tag(TAG)
        server_container_ids = get_container_ids_by_tag(TAG, server_address=SERVER_ADDRESS)
        local_image_ids = get_image_ids_by_tag(TAG)
        server_image_ids = get_image_ids_by_tag(TAG, server_address=SERVER_ADDRESS)

        if local_container_ids != ['']:
            run_command(["docker", "stop"] + local_container_ids)
        if server_container_ids != ['']:
            run_command(["ssh", SERVER_ADDRESS, "docker", "stop"] + server_container_ids)

        if local_container_ids != ['']:
            run_command(["docker", "rm"] + local_container_ids)
        if server_container_ids != ['']:
            run_command(["ssh", SERVER_ADDRESS, "docker", "rm"] + server_container_ids)

        if local_image_ids != ['']:
            run_command(["docker", "rmi", "-f"] + local_image_ids)
        if server_image_ids != ['']:
            run_command(["ssh", SERVER_ADDRESS, "docker", "rmi", "-f", TAG])

        run_command(["docker", "build", "-t", PROJECT_NAME, "."])

        run_command(["docker", "save", "-o", LOCAL_HOME_DIR +"/"+ PROJECT_NAME + ".tar", PROJECT_NAME])

        run_command(["scp", LOCAL_HOME_DIR +"/"+ PROJECT_NAME + ".tar", SERVER_ADDRESS + ":" + SERVER_HOME_DIR])
        run_command(["rm", LOCAL_HOME_DIR +"/"+ PROJECT_NAME + ".tar"])

        run_command(["ssh", SERVER_ADDRESS, "docker", "load", "-i", SERVER_HOME_DIR +"/"+ PROJECT_NAME + ".tar"])

        # run_command(["ssh", SERVER_ADDRESS, "sudo", "docker", "run", "--name", PROJECT_NAME, "-d", "-p",
        #              SERVER_PORT_OUT+":"+SERVER_PORT_IN, "-v", SERVER_HOME+":"+APP_DIR, "-v", APP_DIR+PRESERVED_FOLDER, TAG])

        run_command(["ssh", SERVER_ADDRESS, "cd ~/containers/" + PROJECT_NAME + " && docker-compose", "up", "-d"])

        run_command(["docker", "images"])
        run_command(["ssh", SERVER_ADDRESS, "docker", "images"])


if __name__ == "__main__":
    main()
