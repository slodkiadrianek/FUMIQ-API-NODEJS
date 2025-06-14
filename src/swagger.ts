import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

export const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      description:
        "REST API for FUMIQ\n Technologies used:\n- Node.js\n- Express\n- TypeScript\n- MongoDB\n- Redis\n- Swagger",
      version: "1.0.0",
      title: "Node js Rest API",
      contact: {
        name: "Adrian  Kurek",
        email: "adikurek11@gmail.com",
      },
    },
    servers: [
      {
        url: `http://${process.env.SERVER_IP || "localhost"}:3000`,
      },
    ],
  },
  apis: ["./src/api/v1/routes/*.ts"], // Path to your route files with Swagger comments
};

const swaggerSpec = swaggerJSDoc(options);
export { swaggerUi, swaggerSpec };
