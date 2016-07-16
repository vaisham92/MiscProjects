DROP DATABASE IF EXISTS `twitterdb`;
CREATE DATABASE `twitterdb`;

USE `twitterdb`;

#CREATE USER 'twitteradmin'@'localhost' IDENTIFIED BY 'marias@1234';
GRANT ALL PRIVILEGES on twitterdb.* TO 'twitteradmin'@'localhost';

####
# Structure for table Users
####
CREATE TABLE `Users`(
`puid` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
`email` VARCHAR(50) NOT NULL UNIQUE,
`password` VARCHAR(128) NOT NULL,
`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY (`puid`,`email`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `Users` AUTO_INCREMENT = 90000;

####
# Structure for table User_profiles
####
CREATE TABLE `User_profiles`(
`puid` INT(10) UNSIGNED NOT NULL,
`handle` VARCHAR(20) NOT NULL,
`first_name` VARCHAR(128) NOT NULL,
`last_name` VARCHAR(128) NOT NULL,
`phone` VARCHAR(15),
`city` VARCHAR(50),
`birthday` DATE,
`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY (`puid`, `handle`),
FOREIGN KEY (`puid`) REFERENCES `Users`(`puid`) ON DELETE CASCADE
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

####
# Structure for table Followers
####
CREATE TABLE `Followers`(
`puid` INT(10) UNSIGNED NOT NULL,
`followerid` INT(10) UNSIGNED NOT NULL,
PRIMARY KEY (`puid`, `followerid`),
FOREIGN KEY (`puid`) REFERENCES `Users`(`puid`) ON DELETE CASCADE,
FOREIGN KEY (`followerid`) REFERENCES `Users`(`puid`) ON DELETE CASCADE
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

####
# Structure for table Tweets
####
CREATE TABLE `Tweets`(
`tweetid` INT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
`puid` INT(10) UNSIGNED NOT NULL,
`tweet` VARCHAR(140) NOT NULL,
`handle` VARCHAR(20) NOT NULL,
`first_name` VARCHAR(128) NOT NULL,
`last_name` VARCHAR(128) NOT NULL,
`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY (`tweetid`, `puid`),
FOREIGN KEY (`puid`) REFERENCES `Users`(`puid`) ON DELETE CASCADE
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `Tweets` AUTO_INCREMENT=100008;

####
# Structure for table Retweets
####
CREATE TABLE `Retweets`(
`tweetid` INT(20) UNSIGNED NOT NULL,
`puid` INT(10) UNSIGNED NOT NULL,
`retweetpuid` INT(20) UNSIGNED NOT NULL,
PRIMARY KEY (`tweetid`, `puid`, `retweetpuid`),
FOREIGN KEY (`tweetid`) REFERENCES `Tweets`(`tweetid`) ON DELETE CASCADE,
FOREIGN KEY (`puid`) REFERENCES `Users`(`puid`) ON DELETE CASCADE,
FOREIGN KEY (`retweetpuid`) REFERENCES `Users`(`puid`) ON DELETE CASCADE
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

####
# Structure for table HashTags
####
CREATE TABLE `HashTags`(
`hashid` INT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
`hashtag` VARCHAR(140) NOT NULL UNIQUE,
PRIMARY KEY (`hashid`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

####
# Structure for table HashTagTweets
####
CREATE TABLE `HashTagTweets`(
`tweetid` INT(20) UNSIGNED NOT NULL,
`hashid` INT(20) UNSIGNED NOT NULL,
PRIMARY KEY (`tweetid`,`hashid`),
FOREIGN KEY (`tweetid`) REFERENCES `Tweets` (`tweetid`) ON DELETE CASCADE,
FOREIGN KEY (`hashid`) REFERENCES `HashTags` (`hashid`) ON DELETE CASCADE
)ENGINE=InnoDB DEFAULT CHARSET=utf8;