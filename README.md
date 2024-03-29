
---

# Map-my-seat

🌐 [Map-my-seat.fly.dev](https://map-my-seat.fly.dev/)

## B. PURPOSE

Map-my-seat aims to provide an innovative solution for K-12 teachers looking for an automated approach to creating seating charts. By inputting student details and classroom preferences, educators can efficiently devise their ideal seating arrangements.

## C. FEATURES

The app focuses heavily on form rendering, with a meticulous organization to ensure user-friendliness:
* **Periods & Students Routes**: Dedicated to CRUD operations, allowing seamless integration of information.
* **Classrooms & Seating Charts**: Featuring dynamic tables that synthesize data from the 'periods' and 'students' routes. These routes enable users to visualize and save seating charts based on classroom design and student seating preferences.
* **Data Management**: Users exclusively populate the app's data, apart from SQL incremental identification. While the design follows RESTful principles—with admin users accessing non-admin data—it's adaptable enough for local use, offering full feature access.

## D. TESTING

Tests are strategically located next to the respective files they evaluate. Ensure you have 'jest' installed. To initiate tests, navigate to the target directory and run:
```bash
npm test
```

## E. FLOW

User Journey:
1. Sign Up
2. Input current course details.
3. Register students for each course.
4. Define classroom layout.
5. Detail seating preferences.
6. Obtain a seating chart tailored for each class.

## F. API

The embedded API is a straightforward node.js application (accessible in the "backend" directory).

## G. TECHNOLOGY

Built on the robust framework of React 18.2.0 and Node 20.2.0, this app is a product of VITE. With Chakra UI modules managing the aesthetic appeal, the design is as intuitive as it's visually pleasing. 

To kickstart the backend:
1. Activate the PostgreSQL server (`sudo service postgresql start` for Linux users) on port 5432.
2. Initiate the node backend with `npm start`.
3. Launch the React frontend using `npm start`.

## H. VISION

The driving force behind Map-my-seat is the passion to enhance educators' productivity. Crafting a seating chart, often viewed as mundane, can drain valuable time. In an era steered by technology, a solution that streamlines this process was long overdue. And Map-my-seat hopes to fill that void.

## I. ADDITIONAL NOTES

* **Dockerfile**: For users interested in containers, the project is equipped with a Dockerfile that manages installations for both the Vite/React frontend and the Node.js backend.
* **Database Configuration**: The `fly.toml` file facilitates exporting the PostgreSQL database to a Knex database through fly.io, ensuring seamless data management.
