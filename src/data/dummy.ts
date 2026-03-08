export const colors: string[] = [

    "#FF5733",
    "#33FF57",
    "#5733FF",
    "#33FFFF",
    "#FF33FF",
    "#FF5733",
    "#33FF57",
    "#5733FF",
    "#33FFFF",
    "#FF33FF",
    "#FF5733",
    "#33FF57",
    "#5733FF",
    "#33FFFF",
    "#FF33FF",
    "#FF5733",
    "#33FF57",
    "#5733FF",
    "#33FFFF",
    "#FF33FF",
  ];
  export const badges: string[] = [
    "https://ipprinters.com.pk/wp-content/uploads/2023/02/badge1.jpg",
    "https://static.vecteezy.com/system/resources/thumbnails/022/154/540/small_2x/explosion-of-colored-powder-abstract-colored-background-multicolor-splash-of-particles-festival-of-colors-powder-burst-exploding-and-splashing-powder-holy-festival-photo.jpg",
    "https://ipprinters.com.pk/wp-content/uploads/2023/02/badge1.jpg",
    "https://ipprinters.com.pk/wp-content/uploads/2023/02/badge1.jpg",
    "https://ipprinters.com.pk/wp-content/uploads/2023/02/badge1.jpg",
    "https://ipprinters.com.pk/wp-content/uploads/2023/02/badge1.jpg",
    "https://ipprinters.com.pk/wp-content/uploads/2023/02/badge1.jpg",
    "https://ipprinters.com.pk/wp-content/uploads/2023/02/badge1.jpg",
    "https://ipprinters.com.pk/wp-content/uploads/2023/02/badge1.jpg",
    "https://ipprinters.com.pk/wp-content/uploads/2023/02/badge1.jpg",
    "https://ipprinters.com.pk/wp-content/uploads/2023/02/badge1.jpg",
    "https://ipprinters.com.pk/wp-content/uploads/2023/02/badge1.jpg",
  ];
  

export const Packagex = [
  {
    _id: 12312,
    title: "This is Pakcage 1",
    poster:
      "https://static.vecteezy.com/system/resources/thumbnails/022/154/540/small_2x/explosion-of-colored-powder-abstract-colored-background-multicolor-splash-of-particles-festival-of-colors-powder-burst-exploding-and-splashing-powder-holy-festival-photo.jpg",
    details: "This includes alot \n ok \nthen \n best",
    price: "500PKR",
  },
  {
    _id: 12312244,
    title: "This is Pakcage 2",
    poster: "https://ipprinters.com.pk/wp-content/uploads/2023/02/badge1.jpg",
    details:
      "This includes alot \n best colors \ngood fonts \n test data This includes alot \n best colors \ngood fonts \n test data",
    price: "500PKR",
  },
  {
    _id: 12312233,
    title: "This is Pakcage 1",
    poster:
      "https://static.vecteezy.com/system/resources/thumbnails/022/154/540/small_2x/explosion-of-colored-powder-abstract-colored-background-multicolor-splash-of-particles-festival-of-colors-powder-burst-exploding-and-splashing-powder-holy-festival-photo.jpg",
    details: "This includes alot \n ok \nthen \n best",
    price: "500PKR",
  },
  {
    _id: 12312244312345,
    title: "This is Pakcage 2",
    poster: "https://ipprinters.com.pk/wp-content/uploads/2023/02/badge1.jpg",
    details: "This includes alot \n best colors \ngood fonts \n test data",
    price: "500PKR",
  },
];
import { ChatMessage } from "../screens/groupChat/GroupChatBox";
export const generateRandomMessage = (): ChatMessage => {
  const usernames = [
    "Alice",
    "Bob",
    "Charlie",
    "David",
    "Emma h ",
    "Frank",
    "Grace",
    "Henry",
    "Isabella",
    "Jack",
  ];
  const messages = [
    "Hello!",
    "How are you?",
    "What are you up to?",
    "Nice weather today!",
    "I agree!",
    "That sounds interesting. That sounds interesting. That sounds interesting. That sounds interesting. That sounds interesting. That sounds interesting. ",
  ];

  const randomUsername =
    usernames[Math.floor(Math.random() * usernames.length)];
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return {
    id: Math.random().toString(),
    username: randomUsername,
    message: randomMessage,
    profilePicture:
      "https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg", // Replace with actual URL
  };
};

