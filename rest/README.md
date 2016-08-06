*NOTE: these examples assume that your local DOCKER_HOST is mapped to localdocker, change as necessary to suit your local environment*

### Using the REST Interface - Products
This application implements a simple REST web service that allows you to create, update, delete, list and view Products: the Product object has a simple JSON structure, e.g:

    {
        "id": 1,
        "name": "iPhone",
        "stock": 1
    }

The id field is automatically generated when you create the object.  The service is implemented in Java using [Jersey](https://jersey.java.net/), [Jackson](https://github.com/FasterXML/jackson) and [Guice](https://github.com/google/guice) and persistence is implemented using [MySQL](https://www.mysql.com/) and [Hibernate](http://hibernate.org/orm/).

The simple examples below use curl, but you can [Postman](https://www.getpostman.com/apps) or other REST clients for POST, PUT and DELETE operations and your browser for GET requests.

CREATE

- `curl -X POST -H "Content-Type:application/json" localdocker:8080/SampleApp/products -d '{"name":"iPhone", "stock":1 }'`

UPDATE

- `curl -X PUT -H "Content-Type:application/json" localdocker:8080/SampleApp/products/1 -d '{"name":"iPad", "stock":3 }'`

DELETE

- `curl -X DELETE localdocker:8080/SampleApp/products/1`

LIST

- `curl -X GET localdocker:8080/SampleApp/products`

VIEW

- `curl -X GET localdocker:8080/SampleApp/products/1`

### Using the REST Interface - Exceptions
There is also a REST interface to trigger Java and SQL Exceptions and to run a slow transaction:

Trigger a Java Exception

- `curl -v localdocker:8080/SampleApp/exceptions/java`
- returns `HTTP/1.1 500 Internal Server Error`

Trigger a SQL Exception

- `curl -v localdocker:8080/SampleApp/exceptions/sql`
- returns `HTTP/1.1 500 Internal Server Error`

Trigger a Slow Transaction

- `curl -v localdocker:8080/SampleApp/exceptions/slow/10`
- Path Param specifies number of seconds to complete
- returns `HTTP/1.1 200 OK`