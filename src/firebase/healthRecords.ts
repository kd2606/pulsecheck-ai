import { collection, addDoc, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "./clientApp";

export interface HealthRecordData {
    type: "symptom" | "skin" | "vision" | "cough" | "mental";
    title: string;
    severity: "low" | "moderate" | "high";
    verdict?: "rest" | "monitor" | "doctor_today";
    summary: string;
    details: any;
}

export const saveHealthRecord = async (userId: string | undefined, recordData: HealthRecordData) => {
    if (!userId) return;

    try {
        const recordsRef = collection(db, "users", userId, "healthRecords");

        // Check for exact recent duplicates (within last 5 minutes)
        const fiveMinutesAgo = Timestamp.fromMillis(Date.now() - 5 * 60 * 1000);

        const duplicateQuery = query(
            recordsRef,
            where("type", "==", recordData.type),
            where("title", "==", recordData.title),
            where("date", ">", fiveMinutesAgo)
        );

        const querySnapshot = await getDocs(duplicateQuery);

        if (!querySnapshot.empty) {
            // Duplicate found (e.g., user is just changing language or clicking multiple times) 
            // Exit silently without saving a new record
            return;
        }

        // Save new record
        await addDoc(recordsRef, {
            ...recordData,
            date: Timestamp.now(),
            saved: true
        });

    } catch (error) {
        // Silently ignore errors - auto-saving should not disrupt the user flow
        console.error("Silent ignore: Failed to auto-save health record", error);
    }
};
