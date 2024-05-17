#!/usr/bin/env python3
import argparse
import subprocess
import json
from datetime import datetime

SERVER_ADDRESS = "nucubuntunl"
SERVER_PORT_OUT = "80"
SERVER_PORT_IN = "80"
SERVER_HOME = "/home/ample"
WEBPAGE_DIR = "/webpage"
JSON_FILE_PATH = 'modified_date.json'
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"
PROJECT_NAME = "crystord_web"
TAG = PROJECT_NAME + ":latest"
TAG_2 = PROJECT_NAME + ":v1.0"
DOCKER_NETWORK = "crystord_net"


def change_date():
    data = {'date': datetime.now().strftime(DATE_FORMAT)}

    with open(JSON_FILE_PATH, 'w') as file:
        json.dump(data, file, indent=4)


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

    change_date()
    run_command(["rsync", "-avz", "--delete", "-e", "ssh", "."+WEBPAGE_DIR, "nucubuntunl:" + SERVER_HOME + "/"])
    # Reload nginx inside the docker container
    # run_command(["ssh", "nucubuntunl", "docker", "exec", "-it", PROJECT_NAME, "nginx", "-s", "reload"])

    if not args.silent:
        print("Deploying the container...")

        local_container_ids = get_container_ids_by_tag(TAG)
        server_container_ids = get_container_ids_by_tag(TAG, server_address=SERVER_ADDRESS)
        local_image_ids = get_image_ids_by_tag(TAG)
        server_image_ids = get_image_ids_by_tag(TAG, server_address=SERVER_ADDRESS)

        if local_container_ids != ['']:
            run_command(["docker", "stop"] + local_container_ids)
        if server_container_ids != ['']:
            run_command(["ssh", "nucubuntunl", "docker", "stop"] + server_container_ids)

        if local_container_ids != ['']:
            run_command(["docker", "rm"] + local_container_ids)
        if server_container_ids != ['']:
            run_command(["ssh", "nucubuntunl", "docker", "rm"] + server_container_ids)

        if local_image_ids != ['']:
            run_command(["docker", "rmi", "-f"] + local_image_ids)
        if server_image_ids != ['']:
            run_command(["ssh", "nucubuntunl", "docker", "rmi", "-f", TAG])

        run_command(["docker", "build", "-t", TAG, "."])

        run_command(["docker", "tag", TAG, TAG_2])

        run_command(["docker", "save", "-o", "/home/ample/" + PROJECT_NAME + ".tar", TAG])

        run_command(["scp", "/home/ample/" + PROJECT_NAME + ".tar", "nucubuntunl:/home/ample/"])
        run_command(["rm", "/home/ample/" + PROJECT_NAME + ".tar"])

        run_command(["ssh", "nucubuntunl", "docker", "load", "-i", "/home/ample/" + PROJECT_NAME + ".tar"])

        run_command(["ssh", "nucubuntunl", "sudo", "docker", "run", "--name", PROJECT_NAME, "-d", "-p", SERVER_PORT_OUT+":"+SERVER_PORT_IN, "-v", SERVER_HOME+WEBPAGE_DIR+":"+WEBPAGE_DIR, TAG])

        run_command(["ssh", "nucubuntunl", "docker", "network", "connect", DOCKER_NETWORK, PROJECT_NAME])

        run_command(["docker", "images"])
        run_command(["ssh", "nucubuntunl", "docker", "images"])


if __name__ == "__main__":
    main()
