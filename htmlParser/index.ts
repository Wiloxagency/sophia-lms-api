import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  let htmlString = req.body.data;
  let parsedHtmlString: { type: string; content: string[] }[] = [];

  const h1TagRegex = new RegExp(`\\<h1\\>([\\s\\S]+?)\\<\\/h1>`, "g");
  const h2TagRegex = new RegExp(`\\<h2\\>([\\s\\S]+?)\\<\\/h2>`, "g");
  const h3TagRegex = new RegExp(`\\<h3\\>([\\s\\S]+?)\\<\\/h3>`, "g");
  const h4TagRegex = new RegExp(`\\<h4\\>([\\s\\S]+?)\\<\\/h4>`, "g");
  const h5TagRegex = new RegExp(`\\<h5\\>([\\s\\S]+?)\\<\\/h5>`, "g");
  const h6TagRegex = new RegExp(`\\<h6\\>([\\s\\S]+?)\\<\\/h6>`, "g");
  const pTagRegex = new RegExp(`\\<p\\>([\\s\\S]+?)\\<\\/p>`, "g");
  const ulTagRegex = new RegExp(`\\<ul\\>([\\s\\S]+?)\\<\\/ul>`, "g");

  let h1TagResults = [],
    h1TagMatches;

  let h2TagResults = [],
    h2TagMatches;

  let h3TagResults = [],
    h3TagMatches;

  let h4TagResults = [],
    h4TagMatches;

  let h5TagResults = [],
    h5TagMatches;

  let h6TagResults = [],
    h6TagMatches;

  let pTagResults = [],
    pTagMatches;

  let ulTagResults = [],
    ulTagMatches;

  while ((h1TagMatches = h1TagRegex.exec(htmlString))) {
    h1TagResults.push(h1TagMatches[1]);
  }

  while ((h2TagMatches = h2TagRegex.exec(htmlString))) {
    h2TagResults.push(h2TagMatches[1]);
  }

  while ((h3TagMatches = h3TagRegex.exec(htmlString))) {
    h3TagResults.push(h3TagMatches[1]);
  }

  while ((h4TagMatches = h4TagRegex.exec(htmlString))) {
    h4TagResults.push(h4TagMatches[1]);
  }

  while ((h5TagMatches = h5TagRegex.exec(htmlString))) {
    h5TagResults.push(h5TagMatches[1]);
  }

  while ((h6TagMatches = h6TagRegex.exec(htmlString))) {
    h6TagResults.push(h6TagMatches[1]);
  }

  while ((pTagMatches = pTagRegex.exec(htmlString))) {
    pTagResults.push(pTagMatches[1]);
  }

  while ((ulTagMatches = ulTagRegex.exec(htmlString))) {
    ulTagResults.push(ulTagMatches[1]);
  }

  if (h1TagResults.length > 0) {
    parsedHtmlString.push({ type: "h1", content: h1TagResults });
  }

  if (h2TagResults.length > 0) {
    parsedHtmlString.push({ type: "h2", content: h2TagResults });
  }

  if (h3TagResults.length > 0) {
    parsedHtmlString.push({ type: "h3", content: h3TagResults });
  }

  if (h4TagResults.length > 0) {
    parsedHtmlString.push({ type: "h4", content: h4TagResults });
  }

  if (h5TagResults.length > 0) {
    parsedHtmlString.push({ type: "h5", content: h5TagResults });
  }

  if (h6TagResults.length > 0) {
    parsedHtmlString.push({ type: "h6", content: h6TagResults });
  }

  if (pTagResults.length > 0) {
    parsedHtmlString.push({ type: "p", content: pTagResults });
  }

  if (ulTagResults.length > 0) {
    parsedHtmlString.push({ type: "ul", content: ulTagResults });
  }

//   console.log(parsedHtmlString);
  
  context.res = {
    // status: 200, /* Defaults to 200 */
    body: parsedHtmlString,
  };
};

export default httpTrigger;
