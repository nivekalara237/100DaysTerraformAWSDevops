#!/bin/bash
sudo su
apt update -y
apt install nginx -y

systemctl start nginx.service