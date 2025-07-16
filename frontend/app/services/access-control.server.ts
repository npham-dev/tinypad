import { db } from "@tinypad/common/database";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import z from "zod";
import { randomName } from "~/lib/random-name";
import { tryCatch } from "~/lib/try-catch";
import { pads } from "../../../common/database/schema";
import { getUserCookie, type UserCookie } from "./cookies.server";

const jwtSchema = z.object({
  pads: z.array(z.string()),
});

export const createAccessControl = async (
  request: Request,
  userCookie?: UserCookie | null,
) => {
  const ac = new AccessControl({
    request,
    name: userCookie?.name || randomName(),
    token: userCookie?.token || null,
  });
  if (typeof userCookie === "undefined") {
    await ac.__syncToken();
  }
  return ac;
};

// note: most of the methods in here are designed to fail silently
// for example, if the token is in the incorrect format, we just return no pads

class AccessControl {
  private request: Request;

  private name: string;
  private token: string | null = null;

  constructor(args: { request: Request; name: string; token: string | null }) {
    this.request = args.request;
    this.name = args.name;
    this.token = args.token;
  }

  getName() {
    return this.name;
  }

  getToken() {
    return this.token;
  }

  /**
   * Retrieve token from user cookie if it is not provided to us
   */
  async __syncToken() {
    const userCookie = await getUserCookie(this.request);
    this.name = userCookie?.name || randomName();
    this.token = userCookie?.token || null;
  }

  /**
   * Allowed pads are stored in array format in the jwt
   * We have to verify the jwt & parse it to ensure it meets that standard
   * @returns
   */
  async getPads(): Promise<string[]> {
    if (!this.token) {
      return [];
    }

    const payloadResult = await tryCatch(
      jwt.verify(this.token, process.env.JWT_SECRET!),
    );
    if (payloadResult.error !== null) {
      return [];
    }

    const dataResult = await tryCatch(jwtSchema.parseAsync(payloadResult.data));
    if (dataResult.error !== null) {
      return [];
    }
    return dataResult.data.pads;
  }

  async canManagePad(id: string, isPublic?: boolean): Promise<boolean> {
    if (typeof isPublic === "undefined") {
      // check if pad is public
      const result = await tryCatch(
        db.select({ public: pads.public }).from(pads).where(eq(pads.id, id)),
      );

      if (result.error !== null || result.data.length === 0) {
        return false;
      } else if (result.data[0].public) {
        return true;
      }
    } else if (isPublic) {
      return true;
    }

    // check if we have the proper authorization
    const authorizedPads = await this.getPads();
    return authorizedPads.includes(id);
  }

  async addPad(id: string) {
    let pads = await this.getPads();
    if (!pads.includes(id)) {
      pads.push(id);
    }

    // @todo a more robust solution would probably be to
    // store an anon user id in the jwt
    // store allowed documents in redis (id -> documents)

    // here we just limit the size of the jwt
    if (pads.length > 10) {
      pads.shift();
    }

    return jwt.sign(
      { pads } satisfies z.infer<typeof jwtSchema>,
      process.env.JWT_SECRET!,
      { expiresIn: "7 days" },
    );
  }
}
