"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Users, Plus, Trash2, Loader2 } from "lucide-react";
import { useUser } from "@/firebase/auth/useUser";
import { collection, doc, getDocs, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/clientApp";

interface Person {
    id: string;
    name: string;
    relationship: string;
}

const RELATIONSHIPS = ["self", "spouse", "child", "parent", "sibling", "other"] as const;

export default function PeoplePage() {
    const t = useTranslations("people");
    const { user } = useUser();

    const [people, setPeople] = useState<Person[]>([]);
    const [name, setName] = useState("");
    const [relationship, setRelationship] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) loadPeople();
    }, [user]);

    const loadPeople = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const peopleRef = collection(db, "users", user.uid, "people");
            const snapshot = await getDocs(peopleRef);
            const loadedPeople = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Person));
            setPeople(loadedPeople);
        } catch (error) {
            console.error("Load people error:", error);
        } finally {
            setLoading(false);
        }
    };

    const addPerson = async () => {
        if (!user || !name || !relationship) return;
        setLoading(true);
        try {
            const peopleRef = collection(db, "users", user.uid, "people");
            const docRef = await addDoc(peopleRef, { name, relationship });
            setPeople([...people, { id: docRef.id, name, relationship }]);
            setName("");
            setRelationship("");
            setDialogOpen(false);
        } catch (error) {
            console.error("Add person error:", error);
        } finally {
            setLoading(false);
        }
    };

    const removePerson = async (id: string) => {
        if (!user) return;
        const newPeople = people.filter((p) => p.id !== id);
        try {
            await deleteDoc(doc(db, "users", user.uid, "people", id));
            setPeople(newPeople);
        } catch (error) {
            console.error("Remove person error:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                    <p className="text-muted-foreground">{t("subtitle")}</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> {t("addPerson")}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t("addPerson")}</DialogTitle>
                            <DialogDescription>{t("subtitle")}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>{t("name")}</Label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("relationship")}</Label>
                                <Select value={relationship} onValueChange={setRelationship}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {RELATIONSHIPS.map((rel) => (
                                            <SelectItem key={rel} value={rel}>
                                                {t(`relationships.${rel}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={addPerson} className="w-full" disabled={!name || !relationship || loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {t("addPerson")}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {loading && people.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center gap-4 p-12">
                        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                        <p className="text-muted-foreground">Loading people...</p>
                    </CardContent>
                </Card>
            ) : people.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center gap-4 p-12">
                        <Users className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">{t("noPeople")}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {people.map((person) => (
                        <Card key={person.id}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg">{person.name}</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => removePerson(person.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>{t(`relationships.${person.relationship}`)}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
