import { useState, useEffect, useCallback } from "react";
import { db } from "@/api/firebaseClient";
import { collection, query, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus, Shirt } from "lucide-react";
import ClosetItemCard from "@/components/wardrobe/ClosetItemCard";
import UploadItemDialog from "@/components/wardrobe/UploadItemDialog";
import EditItemDialog from "@/components/wardrobe/EditItemDialog";
import EmptyState from "@/components/wardrobe/EmptyState";
import { ClosetGridSkeleton } from "@/components/wardrobe/Skeletons";

export default function Closet() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    const q = query(collection(db, "users", user.id, "clothingItems"), orderBy("created_date", "desc"));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setItems(list);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (item) => {
    await deleteDoc(doc(db, "users", user.id, "clothingItems", item.id));
    setItems((prev) => (prev || []).filter((i) => i.id !== item.id));
  };

  const loading = items === null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            My Closet
          </h1>
          <p className="text-sm text-muted-foreground">
            {items
              ? `${items.length} item${items.length === 1 ? "" : "s"}`
              : "Loading…"}
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add item
        </Button>
      </div>

      {loading ? (
        <ClosetGridSkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Shirt}
          title="Your closet is empty"
          description="Upload a photo of a clothing item and AI will tag it for you. Build your wardrobe to start getting outfit suggestions."
          action={
            <Button onClick={() => setUploadOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add your first item
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <ClosetItemCard
              key={item.id}
              item={item}
              onDelete={handleDelete}
              onEdit={setEditingItem}
            />
          ))}
        </div>
      )}

      <UploadItemDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onSaved={load}
      />

      <EditItemDialog
        item={editingItem}
        open={!!editingItem}
        onOpenChange={(o) => !o && setEditingItem(null)}
        onSaved={load}
      />
    </div>
  );
}
