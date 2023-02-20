"use client";

import ListingItem from "@/components/shared/ListingItem";
import Loader from "@/components/shared/Loader";
import { auth, db } from "@/lib/firebase/firebase.config";
import { IListingData } from "@/types";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "react-toastify";

const UserListings = () => {
  const [listings, setListings] = useState<IListingData[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    const fetchUserListings = async () => {
      if (!user) return;

      const listingsRef = collection(db, "listings");

      const q = query(
        listingsRef,
        where("userRef", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const querySnap = await getDocs(q);

      const listings: IListingData[] = [];

      querySnap.forEach(doc => {
        listings.push({ ...(doc.data() as IListingData), id: doc.id });
      });

      setListings(listings);
      setLoadingData(false);
    };

    fetchUserListings();
  }, [user]);

  const onDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this listing ?")) {
      await deleteDoc(doc(db, "listings", id));
      const updatedListings = listings.filter(listing => listing.id !== id);
      setListings(updatedListings);
      toast.success("Successfully deleted listing");
    }
  };

  const onEdit = (id: string) => router.push(`/edit-listing/${id}`);

  if (loading || loadingData) {
    return <Loader />;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
      </div>
    );
  }

  return (
    <>
      {user && listings?.length > 0 && (
        <>
          <h2>My listings</h2>
          <ul className="flex flex-col gap-8">
            {listings.map(data => (
              <ListingItem
                key={data.id}
                listing={data}
                onDelete={() => onDelete(data.id)}
                onEdit={() => onEdit(data.id)}
              />
            ))}
          </ul>
        </>
      )}
    </>
  );
};

export default UserListings;