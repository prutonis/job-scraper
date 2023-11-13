import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { JSONPreset } from "lowdb/node";

import { checkLatestJobs } from "@/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await JSONPreset<any>("db.json", []);

  const file = await fs.readFile("./app/data/companies.json", "utf8");

  const companies = JSON.parse(file)?.filter((company: any) => {
    return Boolean(company?.jobListingURL);
  });

  companies?.forEach(async (item: any) => {
    const companyURL = item?.jobListingURL ?? item?.website_url;
    const latestJobs = await checkLatestJobs(companyURL);
    latestJobs?.forEach(async (url: any) => {
      console.log("url: ", db?.data);
      if (db?.data?.find((item: any) => item?.url === url)) return;

      db?.data?.push({
        url,
      });
    });

    db.write();
  });

  return NextResponse.json(null);
}
