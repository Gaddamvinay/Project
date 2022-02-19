FROM ubuntu:18.04
RUN apt-get update 
RUN apt-get install apache2 -y 
RUN apt-get install apache2-utils -y
RUN apt-get clean 
ENV TZ=Europe/Amsterdam
COPY dist /var/www/html/
COPY .htaccess /var/www/html
COPY 000-default.conf /etc/apache2/sites-available/
RUN a2enmod rewrite
EXPOSE 80
EXPOSE 443
CMD apachectl -D FOREGROUND