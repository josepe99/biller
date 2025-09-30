import { NextApiRequest, NextApiResponse } from "next";
import pdfDownloadController from "@/lib/controllers/pdfdownload.controller";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return pdfDownloadController(req, res);
}
