// seed.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Employee from "./models/Employee.js";

const MONGO_URI = process.env.MONGO_URI;

async function seed() {
  await mongoose.connect(MONGO_URI);

  const roles = ["employee", "manager", "hr"];
  const seededPassword = process.env.GLOBAL_PASSWORD;
  const passwordHash = await bcrypt.hash(seededPassword, 10);

  for (const role of roles) {
    const exists = await Employee.findOne({ role });
    if (!exists) {
      await Employee.create({
        empId: role.toUpperCase() + "001",
        name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
        email: `${role}@company.com`,
        role,
        passwordHash,
      });
      console.log(`Seeded ${role} user`);
    }
  }

  mongoose.disconnect();
}

seed();
