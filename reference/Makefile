SUBMIT = cachesim.h cachesim.c cachesim_driver.c Makefile
CFLAGS := -g -Wall -std=c99 -lm
CC=gcc

all: cachesim

cachesim: cachesim.o cachesim_driver.o
	$(CC) -o cachesim cachesim.o cachesim_driver.o 

cachesim.o: cachesim.c
	$(CC) -c -o cachesim.o $(CFLAGS) cachesim.c 

cachesim_driver.o: cachesim_driver.c
	$(CC) -c -o cachesim_driver.o $(CFLAGS) cachesim_driver.c 

clean:
	rm -f cachesim *.o

submit: clean
	tar zcvf bonus-submit.tar.gz $(SUBMIT)
