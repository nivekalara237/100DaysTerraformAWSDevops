# Update package index
sudo apt update

# Install OpenJDK 17
sudo apt install -y openjdk-17-jdk zip unzip
# Set up the JAVA_HOME environment variable
echo "export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))" | sudo tee /etc/profile.d/jdk.sh
source /etc/profile.d/jdk.sh

# download sonarqube server - community version
wget https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-9.9.6.92038.zip

# unzip content
unzip sonarqube-*.zip
sudo mv sonarqube-9.9.6.92038 sonarqube
sudo mv sonarqube /opt/

# Create sonarqube user and its group
sudo groupadd sonarqube
sudo useradd -d /opt/sonarqube -g sonarqube sonarqube
sudo chown -R sonarqube:sonarqube /opt/sonarqube

# Insert user runner after `APP_NAME="SonarQube"` line
sudo sed -i 's/APP_NAME="SonarQube"/APP_NAME="SonarQube"\n\nRUN_AS_USER=sonarqube/' /opt/sonarqube/bin/linux-x86-64/sonar.sh

# create sonarqube launcher service
sudo tee /etc/systemd/system/sonarqube.service <<EOF
[Unit]
Description=SonarQube service
After=syslog.target network.target
[Service]
Type=forking
User=sonarqube
Group=sonarqube
PermissionsStartOnly=true
ExecStart=/opt/sonarqube/bin/linux-x86-64/sonar.sh start
ExecStop=/opt/sonarqube/bin/linux-x86-64/sonar.sh stop
StandardOutput=journal
LimitNOFILE=131072
LimitNPROC=8192
TimeoutStartSec=5
Restart=always
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
EOF

# Installing AWS-CLI
sudo snap install aws-cli --classic

sudo tee /opt/sonarqube/conf/sonar.properties <<EOF
sonar.web.port=9000
sonar.jdbc.username={{DB_USER}}
sonar.jdbc.password=$(aws secretsmanager get-secret-value --secret-id {{SECRET_ARN}} | jq --raw-output '.SecretString' | jq -r .password)
sonar.jdbc.url=jdbc:postgresql://{{DB_SOCKET_ADDRESS}}/{{DB_NAME}}
EOF

# Start SonarQube Server
sudo systemctl enable sonarqube.service
sudo systemctl start sonarqube.service