#include <errno.h> 
#include <stdio.h> 

int main()  { 
	FILE* fp; 

	// opening a file which does not exist 
	fp = fopen("gfg.txt", "r");
	
	if(fp == NULL){
	    printf("File openning error");
	}else{
	    printf("File open successfully");
	}
	return 0; 
}