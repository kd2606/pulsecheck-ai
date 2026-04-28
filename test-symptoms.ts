import { checkSymptoms } from "./src/ai/flows/symptom-checker";

async function main() {
    console.log("Start");
    try {
        const res = await checkSymptoms({
            symptoms: "I have a fever and headache",
            duration: "2 days",
            painScale: 5,
            fever: "High (>100.4°F)"
        });
        console.log(res);
    } catch(err) {
        console.error("Error:", err);
    }
}
main();
