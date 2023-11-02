import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";

import { checkLatestJobs, insertUniqueRecords } from "@/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const file = await fs.readFile(
    process.cwd() + "/app/data/companies.json",
    "utf8"
  );
  const companies = JSON.parse(file)?.filter((company: any) => {
    return Boolean(company?.jobListingURL);
  });

  companies?.forEach(async (item: any) => {
    const companyURL = item?.jobListingURL ?? item?.website_url;
    const url = new URL(companyURL);
    const domainParts = url.hostname.split(".");
    const latestJobs = await checkLatestJobs(companyURL);
    const docs = latestJobs?.map((job: any) => ({
      url: job,
      title: "",
    }));
    await insertUniqueRecords(docs, "jobs", "url");
  });

  return NextResponse.json(null);
}
