Steps to follow:


1) Initial install:

docker-compose build



2) Install the node modules:

docker run -v `pwd`:/src/usr/app markochart_app npm install



3) Run the server:
  
docker-compose up