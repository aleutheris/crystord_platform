import os

index_src_path = 'index.html'
index_dst_path = '/var/www/html'

config_src_path = 'nginx.conf'
config_dst_path = '/etc/nginx'

os.system("sudo cp {} {}".format(index_src_path, index_dst_path))
os.system("sudo cp {} {}".format(config_src_path, config_dst_path))
os.system("sudo systemctl reload nginx")
