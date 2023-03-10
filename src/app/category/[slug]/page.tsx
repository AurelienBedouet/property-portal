"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase.config";
import { toast } from "react-toastify";
import Loader from "@/components/shared/Loader";
import ListingItem from "@/components/shared/ListingItem";
import { IListingData } from "@/types";
import Button from "@/components/layout/Button";

const Category = ({ params }: { params: { slug: string } }) => {
  const [listings, setListings] = useState<IListingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchedListing] = useState({});

  const searchParams = params.slug;

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Get reference
        const listingsRef = collection(db, "listings");

        // Create a query
        const q = query(
          listingsRef,
          where("type", "==", searchParams),
          orderBy("createdAt", "desc"),
          limit(5)
        );

        // Execute query
        const querySnap = await getDocs(q);

        const lastVisible = querySnap.docs[querySnap.docs.length - 1];
        setLastFetchedListing(lastVisible);

        const listings: IListingData[] = [];

        querySnap.forEach(doc => {
          listings.push({ ...(doc.data() as IListingData), id: doc.id });
        });

        setListings(listings);
        setLoading(false);
      } catch (error) {
        toast.error("Could not fetch listings");
      }
    };

    fetchListings();
  }, [searchParams]);

  // Pagination / Load More
  const onFetchMoreListings = async () => {
    try {
      // Get reference
      const listingsRef = collection(db, "listings");

      // Create a query
      const q = query(
        listingsRef,
        where("type", "==", searchParams),
        orderBy("createdAt", "desc"),
        startAfter(lastFetchedListing),
        limit(5)
      );

      // Execute query
      const querySnap = await getDocs(q);

      const lastVisible = querySnap.docs[querySnap.docs.length - 1];
      setLastFetchedListing(lastVisible);

      const listings: IListingData[] = [];

      querySnap.forEach(doc => {
        listings.push({ ...(doc.data() as IListingData), id: doc.id });
      });

      setListings(prevState => [...prevState, ...listings]);
      setLoading(false);
    } catch (error) {
      toast.error("Could not fetch listings");
    }
  };

  return (
    <>
      <header className="mb-8">
        <h1>
          {searchParams === "rent" ? "Places for rent" : "Places for sale"}
        </h1>
      </header>

      {loading ? (
        <Loader />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className="flex flex-col gap-8">
              {listings.map(data => (
                <ListingItem listing={data} key={data.id} />
              ))}
            </ul>
          </main>

          <br />
          <br />
          {lastFetchedListing && (
            <Button
              type="button"
              onClick={onFetchMoreListings}
              buttonStyle="max-w-max bg-slate-800 text-yellow-500"
            >
              Load More
            </Button>
          )}
        </>
      ) : (
        <p>No listings for {searchParams}</p>
      )}
    </>
  );
};

export default Category;
