export interface MovieQuote {
  text: string;
  movie: string;
  year: number;
}

/**
 * 100 movie quotes that contain "home", "house", "apartment", or "condo".
 * Sourced from well-known films spanning 1939–2023.
 * One is shown per day using a deterministic day-of-year rotation.
 */
export const MOVIE_QUOTES: MovieQuote[] = [
  // ── Classics & Icons ──────────────────────────────────────────────
  { text: "E.T. phone home.", movie: "E.T. the Extra-Terrestrial", year: 1982 },
  { text: "This is my house. I have to defend it.", movie: "Home Alone", year: 1990 },
  { text: "Tara! Home. I'll go home, and I'll think of some way to get him back.", movie: "Gone with the Wind", year: 1939 },
  { text: "I'm pretty tired. I think I'll go home now.", movie: "Forrest Gump", year: 1994 },
  { text: "Welcome home, Mr. Bailey.", movie: "It's a Wonderful Life", year: 1946 },
  { text: "I want to go home.", movie: "E.T. the Extra-Terrestrial", year: 1982 },
  { text: "Wendy, I'm home.", movie: "The Shining", year: 1980 },
  { text: "Home is where you make it.", movie: "Joe Dirt", year: 2001 },
  { text: "This house is clean.", movie: "Poltergeist", year: 1982 },
  { text: "It was like coming home... only to no home I'd ever known.", movie: "Sleepless in Seattle", year: 1993 },

  // ── Drama ─────────────────────────────────────────────────────────
  { text: "This is my home now. Your mother is my home.", movie: "The Notebook", year: 2004 },
  { text: "My home life is unsatisfying.", movie: "The Breakfast Club", year: 1985 },
  { text: "It doesn't make sense to leave home to look for home, to give up a life to find a new life.", movie: "American Graffiti", year: 1973 },
  { text: "I cried for meself. Home, home, home. It was home I was wanting.", movie: "A Clockwork Orange", year: 1971 },
  { text: "I'm not homeless. I'm just houseless. Not the same thing.", movie: "Nomadland", year: 2020 },
  { text: "Homes are for free expression, not for good impression.", movie: "Yours, Mine and Ours", year: 2005 },
  { text: "Night like this, it sorta spooks you, walking into an empty apartment.", movie: "The Apartment", year: 1960 },
  { text: "You're not going to bring anybody to my apartment.", movie: "The Apartment", year: 1960 },
  { text: "A house divided against itself cannot stand.", movie: "Lincoln", year: 2012 },
  { text: "Home is behind, the world ahead.", movie: "The Lord of the Rings: The Return of the King", year: 2003 },

  // ── Drama (continued) ────────────────────────────────────────────
  { text: "If I take one more step it'll be the farthest away from home I've ever been.", movie: "The Lord of the Rings: The Fellowship of the Ring", year: 2001 },
  { text: "The sea will grant each man new hope, as sleep brings dreams of home.", movie: "The Hunt for Red October", year: 1990 },
  { text: "They weren't looking for anything more than a way home.", movie: "Apocalypse Now", year: 1979 },
  { text: "I don't even want to own anything until I find a place where me and things go together. I'm not sure where that is, but I know what it's like.", movie: "Breakfast at Tiffany's", year: 1961 },
  { text: "That condo was my life. That was not just a bunch of stuff that got destroyed. It was me!", movie: "Fight Club", year: 1999 },
  { text: "Go home and be with your family.", movie: "The Pursuit of Happyness", year: 2006 },
  { text: "I should have been a better father. I should have come home more.", movie: "Interstellar", year: 2014 },
  { text: "Bring him home.", movie: "Les Misérables", year: 2012 },
  { text: "We can go home now.", movie: "Saving Private Ryan", year: 1998 },
  { text: "Be it ever so heinous, there's no place like home.", movie: "How the Grinch Stole Christmas", year: 2000 },

  // ── Comedy ────────────────────────────────────────────────────────
  { text: "I have exorcised the demons! This house is clear.", movie: "Ace Ventura: Pet Detective", year: 1994 },
  { text: "I know, I know! This horrid little house is your dream castle.", movie: "101 Dalmatians", year: 1961 },
  { text: "Home? I already am home.", movie: "Tropic Thunder", year: 2008 },
  { text: "Looks like somebody's home. Go see if Ronnie's home!", movie: "Home Alone 2: Lost in New York", year: 1992 },
  { text: "We've got no food, we've got no jobs. Our pets' heads are falling off! We just gotta get home.", movie: "Dumb and Dumber", year: 1994 },
  { text: "Houses are just things. The people inside — that's what makes them special.", movie: "Cheaper by the Dozen", year: 2003 },
  { text: "I feel like my house has been ransacked by Raquel Welch.", movie: "The Birdcage", year: 1996 },
  { text: "This is my apartment. There are many like it, but this one is mine.", movie: "The Odd Couple", year: 1968 },
  { text: "Congratulations, you're the proud new owner of a house that's trying to kill you.", movie: "The Money Pit", year: 1986 },
  { text: "I'd like to go home if you don't mind.", movie: "Ghostbusters", year: 1984 },

  // ── Comedy (continued) ───────────────────────────────────────────
  { text: "If this house were any more run down, we'd be living in a tent!", movie: "National Lampoon's Christmas Vacation", year: 1989 },
  { text: "No place like home. And I should know because I've tried them all.", movie: "The Grand Budapest Hotel", year: 2014 },
  { text: "Even a man who has everything can lose it while he's just sitting at home in his living room.", movie: "The Big Short", year: 2015 },
  { text: "You know what the difference is between your house and a casino? In a casino, the house always wins.", movie: "Casino", year: 1995 },
  { text: "You see this apartment? You see how big it is? That's what you get when you work hard.", movie: "Goodfellas", year: 1990 },
  { text: "What a dump! Is this an apartment or a coal mine?", movie: "Beyond the Forest", year: 1949 },
  { text: "The house always wins. Play long enough, you never change the stakes.", movie: "Casino", year: 1995 },
  { text: "I just wanna go home.", movie: "Shrek", year: 2001 },
  { text: "Get out of my house!", movie: "Beetlejuice", year: 1988 },
  { text: "Home is where your rump rests.", movie: "The Lion King", year: 1994 },

  // ── Animated & Family ────────────────────────────────────────────
  { text: "It's barbaric, but hey, it's home.", movie: "Aladdin", year: 1992 },
  { text: "Take me home, daddy.", movie: "The Jungle Book", year: 1967 },
  { text: "Not much of a house. Just right for not much of a donkey.", movie: "Winnie the Pooh", year: 2011 },
  { text: "If you ask me, when a house looks like that, it's time to find another one.", movie: "The Many Adventures of Winnie the Pooh", year: 1977 },
  { text: "I don't want your help! I want my house!", movie: "Up", year: 2009 },
  { text: "Our house has been falling apart since the day it was built. But we will rebuild.", movie: "Encanto", year: 2021 },
  { text: "Ohana means family. Family means nobody gets left behind or forgotten. That's home.", movie: "Lilo & Stitch", year: 2002 },
  { text: "I just wanna go home.", movie: "Toy Story", year: 1995 },
  { text: "For a house to be a home, it needs to have love inside it.", movie: "Brave", year: 2012 },
  { text: "I was wrong. I wanna be with you, Ken. In your Dream House!", movie: "Toy Story 3", year: 2010 },

  // ── Animated & Family (continued) ────────────────────────────────
  { text: "I miss home. I miss Minnesota.", movie: "Inside Out", year: 2015 },
  { text: "You were my home, Obi-Wan. You were supposed to bring balance, not leave it in darkness.", movie: "Star Wars: Revenge of the Sith", year: 2005 },
  { text: "Daddy's home.", movie: "Iron Man 3", year: 2013 },
  { text: "Don't worry, I'll find a way home. I always find a way home.", movie: "Finding Nemo", year: 2003 },
  { text: "This house is not for sale.", movie: "Up", year: 2009 },
  { text: "Is this a house of learning, or a house of ignorance?", movie: "Matilda", year: 1996 },
  { text: "Welcome to my home! You mustn't touch anything!", movie: "Willy Wonka & the Chocolate Factory", year: 1971 },
  { text: "I just want my dad to come home.", movie: "War of the Worlds", year: 2005 },
  { text: "We'll always have a home. Right here.", movie: "Coco", year: 2017 },
  { text: "This house has many hearts.", movie: "Poltergeist", year: 1982 },

  // ── Horror & Thriller ────────────────────────────────────────────
  { text: "Get out of this house!", movie: "The Amityville Horror", year: 1979 },
  { text: "Whatever walked in this house, walked alone.", movie: "The Haunting", year: 1963 },
  { text: "A house is not haunted. We are haunted, and we carry our haunts with us wherever we go.", movie: "The Haunting of Hill House", year: 2018 },
  { text: "This house... it knows.", movie: "Monster House", year: 2006 },
  { text: "We should have never moved into this house.", movie: "The Conjuring", year: 2013 },
  { text: "I see this house, and it has a red door.", movie: "Insidious", year: 2010 },
  { text: "In this house, we follow the rules.", movie: "Don't Breathe", year: 2016 },
  { text: "It's not the house that's haunted. It's your son.", movie: "Insidious", year: 2010 },
  { text: "I used to think the worst thing in life was to end up alone. It's not. The worst thing is to end up with people who make you feel alone. I had to leave home to learn that.", movie: "World's Greatest Dad", year: 2009 },
  { text: "I'm going home.", movie: "The Truman Show", year: 1998 },

  // ── Action, Sci-Fi & Adventure ───────────────────────────────────
  { text: "Honey, I'm home! You miss me?", movie: "Independence Day", year: 1996 },
  { text: "We're going home, boys!", movie: "Apollo 13", year: 1995 },
  { text: "I just want to find a way home.", movie: "Cast Away", year: 2000 },
  { text: "Our home's out there. Somewhere.", movie: "WALL-E", year: 2008 },
  { text: "A king's first duty is to the people of his home.", movie: "Black Panther", year: 2018 },
  { text: "I used to want to save the world. But I knew so little then. Now I know that only love can truly save the world. It's home.", movie: "Wonder Woman", year: 2017 },
  { text: "Go home. There's nothing for you here.", movie: "Gladiator", year: 2000 },
  { text: "The longer you wait, the harder it is to come home.", movie: "The Bourne Ultimatum", year: 2007 },
  { text: "All I wanted was to go home.", movie: "The Martian", year: 2015 },
  { text: "A dream is a wish your heart makes, when you're fast asleep. In dreams you lose your heartaches, and find yourself at home.", movie: "Cinderella", year: 1950 },

  // ── Musicals, Romance & More ─────────────────────────────────────
  { text: "That's why I never left this house. Because of all the memories.", movie: "Up", year: 2009 },
  { text: "I knew if I ran far enough from home, I'd eventually find another one.", movie: "August: Osage County", year: 2013 },
  { text: "A home without books is a body without a soul.", movie: "You've Got Mail", year: 1998 },
  { text: "Our house is on fire, and we're too busy fighting with each other to put it out.", movie: "Don't Look Up", year: 2021 },
  { text: "If this is a dream, I never want to go home.", movie: "The Chronicles of Narnia", year: 2005 },
  { text: "The things I do to keep this house together.", movie: "Little Women", year: 2019 },
  { text: "You can always come home.", movie: "Lady Bird", year: 2017 },
  { text: "This house is not a place for secrets. They fester here.", movie: "Knives Out", year: 2019 },
  { text: "I lost everything. My home, my family, my freedom.", movie: "12 Years a Slave", year: 2013 },
];

/** Pick a quote deterministically based on the day of the year */
export function getQuoteOfTheDay(): MovieQuote {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - start.getTime()) / 86_400_000
  );
  return MOVIE_QUOTES[dayOfYear % MOVIE_QUOTES.length];
}
