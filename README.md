Self-Service Sample Application with Java REST server, MySQL database and Node.js frontend.

### Project Setup

1. Clone the project

1. Navigate to project root folder, then build and run the containers in the background 
	```docker-compose up -d```
1. Now your containers are started. Check your running containers by command `docker ps`. 
* Instrument Java, DB and Machine agents then start Java REST API
	``` docker exec -it rest install-appdynamics <controller-url> <controller-port> <account-name> <access-key>; docker exec rest start-all```
* Instrument Node.js agent and start web service
	``` docker exec -it web install-appdynamics <controller-url> <controller-port> <account-name> <access-key>; docker exec web start```

### See App Running ###
* Java app is running on [192.168.99.100:8080/SampleApp/products](http://192.168.99.100:8080/SampleApp/products)
* Node.js web app is running on [192.168.99.100:3000](http://192.168.99.100:3000/#)

Once your app is running,  you will see this:

![alt tag](https://github.com/Appdynamics/SampleApp/blob/master/web/src/public/img/sampleapp.png)
