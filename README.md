# Daniel Vasser - Technical Assignment Solution

This repository contains a full-stack web application developed as a solution for the provided technical assignment. The application consists of a Spring Boot backend API, a React frontend user interface, and a PostgreSQL database. All components are containerized and orchestrated using Docker Compose for easy setup and execution.

---

## Technical Tasks Addressed:

This solution comprehensively addresses all requirements outlined in the technical task.

### 1. Correct all of the deficiencies in index.html

*   The form elements are implemented using **semantic HTML** (`<form>`, `<label>`, `<input>`, `<select>`, `<option>`) within the `SectorForm.js` React component, significantly improving structure, accessibility, and user experience.
*   Dedicated **CSS modules** (`App.css`, `SectorForm.css`) provide a clean and responsive visual design, moving beyond the unstyled basic HTML.
*   All user interactions, data fetching, and form logic are handled dynamically by **React and JavaScript**, ensuring an interactive and modern web application.

### 2. "Sectors" selectbox:
#### 2.1. Add all the entries from the "Sectors" selectbox to database
#### 2.2. Compose the "Sectors" selectbox using data from database

*   **Backend (`backend/src/main/java/com/example/assignment/model/Sector.java`):** A JPA entity `Sector` is defined to represent each sector, including `id`, `name`, `parentId` (for hierarchical relationships), and `level` (for indentation).
*   **Backend (`backend/src/main/java/com/example/assignment/config/SectorDataLoader.java`):**
    *   This `CommandLineRunner` is executed upon Spring Boot application startup.
    *   It reads the raw HTML snippet containing the `<option>` tags (from `backend/src/main/resources/data/sectors.html`).
    *   Using regular expressions, it parses each option to extract the `value` (which becomes `Sector.id`), the `name`, and determines the `level` of indentation (based on `&nbsp;` characters) and `parentId` to accurately reconstruct the hierarchical structure.
    *   These `Sector` entities are then persisted into the PostgreSQL database. This ensures the database is automatically populated with the initial sector data.
*   **Backend (`backend/src/main/java/com/example/assignment/controller/SectorController.java`):** Exposes a RESTful endpoint `GET /api/sectors` that returns a `List` of all stored `Sector` entities from the database.
*   **Frontend (`frontend/src/components/SectorForm/SectorForm.js`):**
    *   During its initial rendering, the `useEffect` hook makes an API call to `GET http://localhost:8080/api/sectors` to fetch the complete list of sectors.
    *   The `<select multiple>` element is dynamically rendered by iterating over the fetched sector data, creating an `<option>` for each `Sector`. The `sector.level` property is used to generate the correct number of non-breaking spaces (`\u00A0`) to visually represent the hierarchical indentation, mirroring the original HTML structure.

### 3. Perform the following activities after the "Save" button has been pressed:
#### 3.1. Validate all input data (all fields are mandatory)
#### 3.2. Store all input data to database (Name, Sectors, Agree to terms)
#### 3.3. Refill the form using stored data
#### 3.4. Allow the user to edit his/her own data during the session

*   **Backend (`backend/src/main/java/com/example/assignment/model/UserSubmission.java`):**
    *   The `UserSubmission` JPA entity is defined to store the user's `name`, their `selectedSectors` (modeled as a `ManyToMany` relationship with `Sector` entities), and their agreement to terms (`agreeToTerms`).
    *   **Server-side Validation (3.1):** `jakarta.validation` annotations (`@NotBlank`, `@Size`, `@AssertTrue`) are applied directly to the `UserSubmission` fields to enforce mandatory input and other constraints.
*   **Backend (`backend/src/main/java/com/example/assignment/controller/GlobalExceptionHandler.java`):** This `@RestControllerAdvice` component globally catches `MethodArgumentNotValidException` (triggered by server-side validation) and translates validation errors into a user-friendly `Map<String, String>` response for the frontend.
*   **Backend (`backend/src/main/java/com/example/assignment/controller/UserSubmissionController.java`):**
    *   **Data Storage (3.2):**
        *   The `POST /api/submissions` endpoint handles the creation of new user submissions.
        *   The `PUT /api/submissions/{id}` endpoint handles updating existing user submissions. Both utilize `@Valid @RequestBody` to trigger server-side validation and `userSubmissionRepository.save()` for persistence.
    *   The `manageSectors` private helper method ensures that `Sector` entities selected by the user are correctly fetched from the database and associated with the `UserSubmission` object, maintaining data integrity for the `ManyToMany` relationship.
    *   **Data Retrieval for Refill (3.3, 3.4):** The `GET /api/submissions/{id}` endpoint allows fetching a specific `UserSubmission` by its ID.
*   **Frontend (`frontend/src/components/SectorForm/SectorForm.js`):**
    *   **Client-side Validation (3.1):** Basic validation checks for `name` (not empty), `selectedSectors` (at least one selected), and `agreeToTerms` (checked) are performed before submitting to the backend, providing immediate feedback to the user.
    *   **Form Submission & Refill (3.2, 3.3, 3.4):**
        *   The `handleSubmit` function dynamically determines whether to send a `POST` (for new submissions) or `PUT` (for updates) request to the backend based on the presence of a `submissionId` in the component's state.
        *   Upon a successful `POST` or `PUT`, the backend returns the saved `UserSubmission` object. This data is then used to update the frontend's state (`name`, `selectedSectors`, `agreeToTerms`), effectively **refilling the form with the most current stored data**.
        *   The `id` of the successfully saved submission is stored in the browser's `localStorage`.
        *   **Session Persistence (3.4):** On subsequent page loads or refreshes, a `useEffect` hook checks `localStorage` for a `submissionId`. If found, it makes a `GET /api/submissions/{id}` request to retrieve the user's previously saved data and **pre-fills the form**, allowing the user to seamlessly **edit their own data during the session**.

---

## How to Run the Application:

This application is designed for easy setup and execution using Docker Compose.

1.  **Prerequisites:**
    *   Docker Desktop (or Docker Engine and Docker Compose) installed and running on your system.

2.  **Download and Extract:**
    *   Extract the provided `.zip` archive to a desired location on your machine.
    *   Navigate into the root directory of the extracted project, which contains the `docker-compose.yml` file.

3.  **Build and Start the Services:**
    From the project root directory, execute the following command in your terminal:
    ```bash
    docker compose up --build -d
    ```
    *   `--build`: This flag ensures that the Docker images for both the backend and frontend services are built from their respective `Dockerfile`s.
    *   `-d`: This runs the services in detached mode, allowing them to run in the background.

4.  **Access the Application:**
    Once all services are up and running:
    *   **Frontend (User Interface):** Open your web browser and navigate to `http://localhost:3000`
    *   **Backend API (for direct testing, optional):** The Spring Boot backend API is accessible on `http://localhost:8080` (e.g., `http://localhost:8080/api/sectors`).

5.  **Stop and Clean Up:**
    To stop all running services and remove their containers, networks, and persistent data volumes (including the PostgreSQL database data), run:
    ```bash
    docker compose down -v
    ```
    *   `-v`: This flag is crucial if you want to completely reset the database state.

---

## Provided Files:

*   `docker-compose.yml`: Defines and configures the multi-service Docker application.
*   `backend/`: Contains the complete **Spring Boot backend** source code, including its `Dockerfile`.
*   `frontend/`: Contains the complete **React frontend** source code, including its `Dockerfile`.
*   `db_dump.sql`: A full database dump (schema and initial data) generated from a successful run of the application.

---

**Thank you for considering my application!**
