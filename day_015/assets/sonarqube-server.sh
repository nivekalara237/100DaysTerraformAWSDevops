# Update package index
sudo apt update

# Install OpenJDK 17
sudo apt install -y openjdk-17-jdk zip unzip

# Verify Java installation
java -version

# Set up the JAVA_HOME environment variable
# echo "export SONAR_JAVA_PATH="path/to/java_home/bin/java""
echo "export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))" | sudo tee /etc/profile.d/jdk.sh
source /etc/profile.d/jdk.sh

# Installing Postgres
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main" /etc/apt/sources.list.d/pgdg.list'
wget -q https://www.postgresql.org/media/keys/ACCC4CF8.asc -O - | sudo apt-key add -
sudo apt install postgresql postgresql-contrib -y

# Initiate the database server to begin operations
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Create database and it owner

sudo -u postgres psql -c "CREATE DATABASE sonarqubedb;"
sudo -u postgres psql -c "CREATE USER sonar WITH ENCRYPTED PASSWORD 'sonar';"
sudo -u postgres psql -c "GRANT ALL ON SCHEMA public TO sonar;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sonarqubedb TO sonar;"
sudo -u postgres psql -c "ALTER DATABASE sonarqubedb OWNER TO sonar;"

# download sonarqube server - community version
# shellcheck disable=SC2317
wget https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-9.9.6.92038.zip

# unzip content
# shellcheck disable=SC2317
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

sudo tee /opt/sonarqube/conf/sonar.properties <<EOF
sonar.web.port=9000
sonar.jdbc.username=sonar
sonar.jdbc.password=sonar
sonar.jdbc.url=jdbc:postgresql://localhost:5432/sonarqubedb
EOF

# Start SonarQube Server
sudo systemctl enable sonarqube.service
sudo systemctl start sonarqube.service