import { analytics } from "../data/mockData.js";

export function getAnalytics(req, res) {
  res.json({
    ok: true,
    data: analytics
  });
}
