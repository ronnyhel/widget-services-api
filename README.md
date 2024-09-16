
# Widget-Services API

## Description
This project implements a Services API that can be used to support a dashboard widget. 
### Implementd features:

- **Return a list of services**: <br>
   Supports filtering, sorting, and pagination.
- **Fetch a specific service**: <br>
  Retrieve the details of a particular service including ist first 
- **Unit Test and Integration Test**: <br>
  The project includes unit tests and end-to-end tests to ensure the correctness of part of the implemented features (not all is tested). 
- **Authentication/authorization**: <br>
  Read more about this in the Authentication and Route Protection section below.
- **CRUD operations to the API**: <br>
  The API supports creating, reading, updating, and deleting services.<br>
  DELETING AND UPDATING use typeorm transactions to ensure data consistency.<br>
  No tests are implemented for these operations.

## Tech Stack

The following technologies are used in this project:

- **PostgreSQL**: Version 12
- **Node.js**: Version 16
- **Nest.js**: Version 6.10
- **TypeORM**: Version 0.2
- **TypeScript**
- **Docker**
- **passport**

## Authentication and Route Protection
This API uses Passport.js for authentication and route protection. 

### JWT-protected routes:
- **api/v1/widget-service**
- **api/v1/widget-service/:id**

### Passport-local routes:
- **api/v1/auth/login**


Login route (/auth/login): The login route is protected by passport-local. It checks the credentials provided by the user (username and password). The credentials are validated against the user table in the database, where passwords are stored as bcrypt-hashed values.
`Running e2e tests will populate the database and create a user with test/test credentials.`
## Design Decision: `numOfVersions` Column

In this implementation, the `numOfVersions` column was introduced in the `WidgetService` entity to optimize the `findAll` function. This avoids the need to count all occurrences in the `WidgetVersion` table for each `WidgetService` when fetching a list of services, which could negatively impact performance, especially with a large dataset.

## Handling Version Limits with `moreVersionsExist`

In the `findOne` method, the API is designed to limit the number of `WidgetVersion` entities returned for a given `WidgetService`. Specifically, the method will return at most **10 versions** per service. This limit is controlled by a constant `MAX_VERSIONS_RETRIEVED_BY_FINDONE`.

### Why `moreVersionsExist`?

To handle cases where a `WidgetService` has more than 10 associated versions, we introduce the `moreVersionsExist` field in the `WidgetServiceDto`. This field is set to `true` if the service has more versions than the API is currently returning. This flag serves as an indicator for the client application that additional versions exist but are not included in the current response.
Same result can be achieved by counting the wiget versions array returned and comparing it to the numOfVersions field in the WidgetService entity, but I opted for a more explicit approach.

### Potential Scalability Issue

The number of `WidgetVersion` entities associated with a `WidgetService` is potentially **unbounded**. In cases where a service has a large number of versions, returning all versions in a single response would be inefficient and could negatively impact the performance of both the API and the client consuming the data.

### Recommended Solution: Paginated Endpoint for Versions

To address this issue, a dedicated endpoint should be implemented to handle the retrieval of versions with **pagination** support. This would allow the API to return the versions in smaller, manageable chunks, optimizing both performance and scalability.
### Suggested API Endpoint

A new endpoint `/widget-service/:id/version` could be introduced to fetch `WidgetVersion` entities in a paginated way:

```http
GET /widget-service/:id/version?page=1&pageSize=10...
```

### Trade-offs:
- **Performance gain**: The `findAll` query is faster since it doesn't have to perform a `COUNT` query for each service every time it retrieves data.
- **Impact on data consistency**: Whenever a new version is created for a service, the `numOfVersions` field must be manually incremented on the `WidgetService` table to ensure consistency. This introduces a small overhead during resource creation but is a necessary trade-off for faster data retrieval in read operations since I considered that the number of reads will be much higher than the number of writes.

### Important Consideration:
- When inserting a new `WidgetVersion`, you need to ensure that the `numOfVersions` counter on the `WidgetService` table is incremented accordingly.

## Installation

To set up and run this project locally, follow these steps:

1. **Unzip the file **: First, unzip the file to your local machine and navigate into the created directory.

   ```bash
   cd <unzipped-directory>
   ```

2. **Create a `.env` file**: Create a `.env` file in the root of your project directory with the following configuration:

   ```bash
   POSTGRES_USER=MY-USER
   POSTGRES_PASSWORD=MY-PASSWORD
   POSTGRES_DB=MY-DB
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5433
   JWT_SECRET=MY-SECRET
   ```

3. **Start the database**: You need to run a PostgreSQL instance using Docker. If you already have Docker installed, you can start the database with the following command:

   ```bash
   docker compose up -d
   ```

   This will start PostgreSQL using the settings in the `.env` file.

4. **Install the project dependencies**: After setting up the environment, install the required dependencies:

   ```bash
   npm install
   ```

## Testing

### Running Unit Tests

To run the unit tests for the application, use the following command:

```bash
npm test
```

### Running End-to-End (E2E) Tests

To run the end-to-end tests, use this command:

```bash
npm run test:e2e
```

please notice that this operation clear and then populates the database with some fix data to test the API and create a user with test/test credentials.

## Running the Application

After completing the setup, you can run the application using the following command:

```bash
npm run start
```

The API should now be running, and you can access it at 
- Post `http://localhost:3000/v1/api/auth/login` to login and get a token.
- Get `http://localhost:3000/v1/api/widget-services` to get a list of services.
- Get `http://localhost:3000/v1/api/widget-services/:id` to get a specific service.
- Post `http://localhost:3000/v1/api/widget-services` to create a new service.
- Put `http://localhost:3000/v1/api/widget-services/:id` to update a service.
- Delete `http://localhost:3000/v1/api/widget-services/:id` to delete a service.


## Building the Project

To create a production-ready build of the project, use the following command:

```bash
npm run build
```

This will generate the compiled files in the `dist` folder.

## Populate the Database

If you want to clear all the tables, reset the sequences and re-populate the database with fixture data, you can run the following command:

```bash
npm run populate-db
```



---

This README provides all the steps necessary to install, run, test, and build the project, as well as instructions on how to set up the environment and database.
