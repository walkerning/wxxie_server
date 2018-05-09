create database test_wxxie_database;
create database dev_wxxie_database;
create user 'test_wxxie_user'@'localhost' identified by '12345678';
grant all privileges on test_wxxie_database.* to 'test_wxxie_user'@'localhost';
grant all privileges on dev_wxxie_database.* to 'test_wxxie_user'@'localhost';
