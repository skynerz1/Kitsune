"use client";
import React, { useState } from "react";
import Image from "next/image";

import Container from "@/components/container";
import AnimeCard from "@/components/anime-card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import WatchButton from "@/components/watch-button";
import { IAnime } from "@/types/anime";
import AnimeCarousel from "@/components/anime-carousel";
import AnimeEpisodes from "@/components/anime-episodes";
import CharacterCard from "@/components/common/character-card";
import { ROUTES } from "@/constants/routes";
import WatchTrailer from "@/components/watch-trailer";
import Select, { ISelectOptions } from "@/components/common/select";
import {
  Ban,
  BookmarkCheck,
  CheckCheck,
  Hand,
  Heart,
  TvMinimalPlay,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useGetAnimeDetails } from "@/query/get-anime-details";
import Loading from "@/app/loading";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import useBookMarks from "@/hooks/use-get-bookmark";
import { useGetAnimeBanner } from "@/query/get-banner-anime";

const SelectOptions: ISelectOptions[] = [
  {
    value: "plan to watch",
    label: "مخطط للمشاهدة",
    icon: BookmarkCheck,
  },
  {
    value: "watching",
    label: "أشاهد حاليًا",
    icon: TvMinimalPlay,
  },
  {
    value: "completed",
    label: "اكتملت",
    icon: CheckCheck,
  },
  {
    value: "on hold",
    label: "معلقة مؤقتًا",
    icon: Hand,
  },
  {
    value: "dropped",
    label: "تم الإلغاء",
    icon: Ban,
  },
];


const Page = () => {
  const { slug } = useParams();
  const { data: anime, isLoading } = useGetAnimeDetails(slug as string);
  const { auth } = useAuthStore();
  const { bookmarks, createOrUpdateBookMark } = useBookMarks({
    animeID: slug as string,
    page: 1,
    per_page: 1,
  });
  const [selected, setSelected] = useState(bookmarks?.[0]?.status || "");

  const { data: banner, isLoading: bannerLoading } = useGetAnimeBanner(
    anime?.anime.info.anilistId!,
  );

  const handleSelect = async (value: string) => {
    if (!auth) {
      return;
    }
    const previousSelected = selected;
    setSelected(value);

    try {
      await createOrUpdateBookMark(
        slug as string,
        anime?.anime.info.name!,
        anime?.anime.info.poster!,
        value,
      );
    } catch (error) {
      console.log(error);
      setSelected(previousSelected);
      toast.error("Error adding to list", { style: { background: "red" } });
    }
  };

  return isLoading || !anime ? (
    <Loading />
  ) : (
    <div className="w-full z-50">
      <div className="h-[30vh] md:h-[40vh] w-full relative ">
        {bannerLoading ? (
          <div className="absolute inset-0 m-auto w-full h-full bg-slate-900 animate-pulse"></div>
        ) : (
          <Image
            src={
              (banner?.Media.bannerImage as string) || anime.anime.info.poster
            }
            alt={anime.anime.info.name}
            height={100}
            width={100}
            className="h-full w-full object-cover"
            unoptimized
          />
        )}

        <WatchTrailer
          videoHref={anime.anime.info.promotionalVideos[0]?.source}
        />
        <div className="absolute h-full w-full inset-0 m-auto bg-gradient-to-r from-slate-900 to-transparent"></div>
      </div>
      <Container className="z-50 md:space-y-10 pb-20">
        <div className="flex md:mt-[-9.375rem] mt-[-6.25rem] md:flex-row flex-col md:items-end md:gap-20 gap-10 ">
          <AnimeCard
            title={anime.anime.info.name}
            poster={anime.anime.info.poster}
            href={`${ROUTES.ANIME_DETAILS}/${anime.anime.info.id}`}
            displayDetails={false}
            variant="lg"
            className="shrink-0"
          />
          <div className="flex flex-col md:gap-5 gap-2 pb-16">
            <h1 className="md:text-5xl text-2xl md:font-black font-extrabold z-[9]">
              {anime.anime.info.name}
            </h1>
            <div className="flex items-center gap-5">
              <WatchButton />
              {auth && (
                <Select
                  placeholder="Add to list"
                  value={bookmarks?.[0]?.status || selected}
                  options={SelectOptions}
                  onChange={handleSelect}
                  placeholderIcon={Heart}
                />
              )}
            </div>
          </div>
        </div>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="flex items-center justify-start w-fit text-2xl h-fit">
            <TabsTrigger
              value="overview"
              className="md:text-2xl text-lg font-semibold"
            >
              نظره عامة
            </TabsTrigger>

            <TabsTrigger
              value="episodes"
              className="md:text-2xl text-lg font-semibold"
            >
              ألحلقات
            </TabsTrigger>
            {anime.anime.info.charactersVoiceActors.length > 0 && (
              <TabsTrigger
                value="characters"
                className="md:text-2xl text-lg font-semibold"
              >
                ألشخصيات
              </TabsTrigger>
            )}
            {anime.seasons.length > 0 && (
              <TabsTrigger
                value="relations"
                className="md:text-2xl text-lg font-semibold"
              >
                ذات صلة
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent
            value="overview"
            className="w-full grid md:grid-cols-5 grid-cols-1 gap-x-20 gap-y-5 mt-10"
          >
            <div className="col-span-1 flex flex-col gap-5 w-full">
              <h3 className="text-xl font-semibold">تفاصيل</h3>
              <div className="grid grid-cols-2 w-full md:text-base text-xs gap-y-2 gap-x-20 md:gap-x-0">
                <h3>تاريخ العرض</h3>
                <span>{anime.anime.moreInfo.aired}</span>

                <h3>ألتقييمات</h3>
                <span>{anime.anime.info.stats.rating}</span>

                <h3>الانواع</h3>
                <span>{anime.anime.moreInfo.genres.join(", ")}</span>

                <h3>النوع</h3>
                <span>{anime.anime.info.stats.type}</span>

                <h3>الحالة</h3>
                <span>{anime.anime.moreInfo.status}</span>

                <h3>الموسم</h3>
                <span className="capitalize">{}</span>

                <h3>العمل الفني</h3>
                <span>{anime.anime.moreInfo.studios}</span>
              </div>
            </div>
            <div className="col-span-4 flex flex-col gap-5">
              <h3 className="text-xl font-semibold">الوصف</h3>
              <p className="md:text-base text-xs leading-6">
                {anime.anime.info.description}
              </p>
            </div>
          </TabsContent>

          <TabsContent
            value="relations"
            className="w-full flex flex-col gap-5 "
          >
            <h3 className="text-xl font-semibold">ذات صله</h3>
            <div className="grid lg:grid-cols-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7 w-full gap-5 content-center">
              {anime.seasons.map((relation, idx) => {
                return (
                  !relation.isCurrent && (
                    <AnimeCard
                      key={idx}
                      title={relation.name}
                      subTitle={relation.title}
                      poster={relation.poster}
                      className="self-center justify-self-center"
                      href={`${ROUTES.ANIME_DETAILS}/${relation.id}`}
                    />
                  )
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="episodes" className="flex flex-col gap-5">
            <AnimeEpisodes animeId={anime.anime.info.id} />
          </TabsContent>
          {!!anime.anime.info.charactersVoiceActors.length && (
            <TabsContent
              value="characters"
              className="w-full flex flex-col gap-5 "
            >
              <h3 className="text-xl font-semibold">ئخصيات ألانمي</h3>
              <div className="grid lg:grid-cols-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7 w-full gap-5 content-center">
                {anime.anime.info.charactersVoiceActors.map(
                  (character, idx) => {
                    return (
                      <CharacterCard
                        key={idx}
                        character={character}
                        className="self-center justify-self-center"
                      />
                    );
                  },
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>

        {!!anime.recommendedAnimes.length && (
          <AnimeCarousel
            anime={anime.recommendedAnimes as IAnime[]}
            title="Recommended"
            className="pt-20"
          />
        )}
      </Container>
    </div>
  );
  //eslint-disable-next-line
};

export default Page;
