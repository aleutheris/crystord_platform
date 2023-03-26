import os

config_src_path = 'nginx.conf'
config_dst_path = '/etc/nginx'

os.system("sudo cp {} {}".format(config_src_path, config_dst_path))
os.system("sudo systemctl reload nginx")
