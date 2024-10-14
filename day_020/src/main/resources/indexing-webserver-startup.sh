sudo apt update

sudo apt install -y openjdk-21-jdk zip unzip
# Set up the JAVA_HOME environment variable
echo "export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))" | sudo tee /etc/profile.d/jdk.sh
source /etc/profile.d/jdk.sh

java --version

# installing MAVEN
sudo apt install -y maven

mvn --version

cd /home/ubuntu

git clone --branch day20/producer-and-consumers https://github.com/nivekalara237/100DaysTerraformAWSDevops.git
# shellcheck disable=SC2164
cd 100DaysTerraformAWSDevops/apps/ms-indexing

mvn clean install package

nohup java -jar target/ms-indexing-*.jar > /home/ubuntu/stdout.log 2>&1 &