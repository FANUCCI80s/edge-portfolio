import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/auth/password";

const ADMIN_EMAIL = "kenny.lv72@gmail.com";
const ADMIN_PASSWORD = "4DM1N1$TR4TOR260107";

async function main() {
  const email = ADMIN_EMAIL.trim().toLowerCase();

  console.log(`Looking for ${email}...`);

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    console.error(`No user was found with email: ${email}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Found user: ${user.firstName} ${user.lastName}`);
  console.log("Updating account...");

  const passwordHash = await hashPassword(ADMIN_PASSWORD);

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      email,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      status: true,
    },
  });

  console.log("");
  console.log("======================================");
  console.log("EDGE PORTFOLIO ADMIN ACCOUNT READY");
  console.log("======================================");
  console.log(`Name:   ${updatedUser.firstName} ${updatedUser.lastName}`);
  console.log(`Email:  ${updatedUser.email}`);
  console.log(`Role:   ${updatedUser.role}`);
  console.log(`Status: ${updatedUser.status}`);
  console.log("======================================");
  console.log("");
  console.log("Admin account updated successfully.");
}

main()
  .catch((error) => {
    console.error("");
    console.error("Failed to update admin account:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });