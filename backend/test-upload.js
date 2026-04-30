import axios from "axios";
import FormData from "form-data";
import fs from "fs";

async function test() {
  try {
    const form = new FormData();
    form.append("accountId", "smart");
    form.append("file", Buffer.from("Hello world"), "test.txt");

    // We need a valid JWT token. But we don't have one easily.
    console.log("Cannot test easily without JWT token.");
  } catch (err) {
    console.error(err);
  }
}
test();
