import { z } from "zod";

console.log(
  new URL(encodeURIComponent("http://app.com/hello  *()+"), "http://localhost"),
);
