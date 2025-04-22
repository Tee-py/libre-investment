import cors from "cors";

const whitelist = [
  "http://localhost:3000",
  "https://libre-frontend.app",
  "https://www.libre-frontend.app",
];

const apiCors = cors({
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`Origin: ${origin} is Not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ["POST", "GET", "PUT", "DELETE", "PATCH"],
});

export default apiCors;
