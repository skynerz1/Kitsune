"use client";

import ContinueWatching from "@/components/continue-watching";
import FeaturedCollection from "@/components/featured-collection";
import { useGetHomePageData } from "@/query/get-home-page-data";
import { IAnime, LatestCompletedAnime, SpotlightAnime } from "@/types/anime";
import dynamic from "next/dynamic";

// Dynamically import components
const HeroSection = dynamic(() => import("@/components/hero-section"));
const LatestEpisodesAnime = dynamic(
  () => import("@/components/latest-episodes-section"),
);
const AnimeSchedule = dynamic(() => import("@/components/anime-schedule"));
const AnimeSections = dynamic(() => import("@/components/anime-sections"));

export default function Home() {
  const { data, isLoading } = useGetHomePageData();

  return (
    <div className="flex flex-col bg-[#121212]">
      <HeroSection
        spotlightAnime={data?.spotlightAnimes as SpotlightAnime[]}
        isDataLoading={isLoading}
      />
      <LatestEpisodesAnime
        loading={isLoading}
        latestEpisodes={data?.latestEpisodeAnimes as LatestCompletedAnime[]}
      />

      <ContinueWatching loading={isLoading} />

      <FeaturedCollection
        loading={isLoading}
        featuredAnime={[
          {
            title: "الأنمي المفضل لدى الأغلبية",
            anime: data?.mostFavoriteAnimes as IAnime[],
          },
          {
            title: "الأنمي الأكثر شهرة",
            anime: data?.mostPopularAnimes as IAnime[],
          },
          {
            title: "أحدث الأنميات المكتملة",
            anime: data?.latestCompletedAnimes as LatestCompletedAnime[],
          },
        ]}
      />
      <AnimeSections
        title={"الأنميات الرائجة"}
        trendingAnime={data?.trendingAnimes as IAnime[]}
        loading={isLoading}
      />

      <AnimeSchedule />

      <AnimeSections
        title={"الأنميات القادمة"}
        trendingAnime={data?.topUpcomingAnimes as IAnime[]}
        loading={isLoading}
      />
    </div>
  );
}
