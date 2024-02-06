import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  // SafeAreaView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../theme";
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
} from "react-native-heroicons/outline";
import { MapPinIcon } from "react-native-heroicons/solid";
import { fetchLocations, fetchWeatherForecast } from "../api/weather";
import { debounce } from "lodash";
import { weatherImages } from "../constants";
import * as Progress from "react-native-progress";
import { getData, storeData } from "../utils/asyncStorage";

const HomeScreen = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});

  const handleLocation = (loc) => {
    setLocations([]);
    setShowSearch(false);
    setLoading(true);
    fetchWeatherForecast({
      cityName: loc.name,
      days: '7',
    }).then((data) => {
      setWeather(data);
      setLoading(false);
      storeData("city", loc.name);
    });
  };
  const handleSearch = (value) => {
    if (value.length > 2) {
      fetchLocations({ cityName: value }).then((data) => {
        setLocations(data);
      })
    }
  };
  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  // const fetchMyWeatherData = async () => {
  //   let myCity = await getData("city");
  //   let cityName = "London";
  //   if (myCity) cityName = myCity;
  //   fetchWeatherForecast({
  //     cityName,
  //     days:'7',
  //   }).then((data) => {
  //     setWeather(data);
  //     // console.log(data)
  //     setLoading(false);
  //   });
  // };
  const fetchMyWeatherData = async () => {

    fetchWeatherForecast({ cityName: "Riyadh", days: "7" }).then((data) => {
      setWeather(data);
      // console.log(data)
      setLoading(false);
    });
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);
  const { current, location } = weather;

  return (
    <View className=" flex-1  relative">
      <StatusBar style="light" />
      <Image
        blurRadius={50}
        source={require("../assets/images/bg.png")}
        className="absolute w-full h-full"
      />
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
        </View>
      ) : (
        <SafeAreaView className="flex-1 flex py-5">
          {/* SearchSection */}
          <View style={{ height: "7%" }} className="mx-4 relative z-50">
            <View
              className="flex-row items-center justify-end rounded-full"
              style={{
                backgroundColor: showSearch
                  ? theme.bgWhite(0.2)
                  : theme.bgWhite(0),
              }}
            >
              {showSearch ? (
                <TextInput
                  onChangeText={handleTextDebounce}
                  placeholder="Search City"
                  placeholderTextColor={"lightgray"}
                  className="pl-6 pb-1 h-10  flex-1 text-white text-base"
                />
              ) : null}
              <TouchableOpacity
                onPress={() => setShowSearch(!showSearch)}
                style={{ backgroundColor: theme.bgWhite(0.3) }}
                className="rounded-full p-3 m-1"
              >
                <MagnifyingGlassIcon size={25} color="white" />
              </TouchableOpacity>
            </View>
            {/* new Element */}
            {showSearch && locations.length  > 0 ? (
              <View className="w-full bg-gray-300 rounded-3xl absolute top-16">
                {locations.map((loc, index) => {
                  return (
                    <TouchableOpacity
                      onPress={() => handleLocation(loc)}
                      key={index}
                      style={{
                        borderBottomWidth:
                          index == locations.length - 1 ? 0 : 2,
                      }}
                      className="flex-row items-center border-0  border-b-gray-400 p-3 mb-1 "
                    >
                      <MapPinIcon size={25} color="gray" />
                      <Text className="text-black text-lg ml-2">
                        {loc?.name}, {loc?.country}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>
          {/* forecast section */}
          {
            !showSearch?(
              <>
                <View className="mx-4 justify-around flex-1 mb-2">
            {/* location */}
            <Text className="text-white text-center text-2xl font-bold">
              {location?.name},{" "}
              <Text className="text-lg font-semibold text-gray-300">
                {" " + location?.country}
              </Text>
            </Text>
            {/* weather image */}
            <View className="flex-row justify-center">
              <Image
                source={weatherImages[current?.condition?.text]}
                className="w-52 h-52"
              />
            </View>
            {/* degree celcius */}
            <View>
              <Text className="text-white text-center text-6xl font-bold ml-5">
                {current?.temp_c}&#176;
              </Text>
              <Text className="text-white text-center text-xl font-bold tracking-widest">
                {current?.condition.text}
              </Text>
            </View>
            {/* other stats */}
            <View className="flex-row justify-between mx-4">
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../assets/icons/wind.png")}
                  className="w-6 h-6"
                />
                <Text className="text-white font-semibold text-base">
                  {current?.wind_kph}km
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../assets/icons/drop.png")}
                  className="w-6 h-6"
                />
                <Text className="text-white font-semibold text-base">
                  {current?.humidity}%
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../assets/icons/sun.png")}
                  className="w-6 h-6"
                />
                <Text className="text-white font-semibold text-base">
                  {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                </Text>
              </View>
            </View>
          </View>
          {/* forecast for next days */}
          <View className="mb-2 space-y-3">
            <View className="flex-row items-center mx-5 space-x-2">
              <CalendarDaysIcon size={22} color="white" />
              <Text className="text-white  text-base">Daily forecast</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 15 }}
            >
        
              {weather?.forecast?.forecastday?.map((item, index) => {
                let date = new Date(item.date);
                let options = { weekday: "long" };
                let dayName = date.toLocaleDateString("en-US", options);
                dayName = dayName.split(",")[0];
                return (
                  <View
                    key={index}
                    style={{ backgroundColor: theme.bgWhite(0.15) }}
                    className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                  >
                    <Image
                      source={weatherImages[item?.day?.condition?.text]}
                      className="w-11 h-11"
                    />
                    <Text className="text-white">{dayName}</Text>
                    <Text className="text-white font-semibold text-xl">
                      {item?.day?.avgtemp_c}&#176;
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
              </>
            ):null
          }
        </SafeAreaView>
      )}
    </View>
  );
};
export default HomeScreen;
