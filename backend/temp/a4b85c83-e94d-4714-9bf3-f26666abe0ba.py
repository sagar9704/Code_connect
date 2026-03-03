#include <stdio.h>
#include <stdlib.h>

int main() {
    FILE *inputFile;
    FILE *outputFile;
    int number;
    int sum = 0;
    int count = 0;
    double average = 0.0;

    // --- 1. Open the input file for reading ---
    inputFile = fopen("input.txt", "r");
    if (inputFile == NULL) {
        perror("Error opening input.txt");
        return 1; // Exit with error code
    }

    // --- 2. Read numbers from the file and calculate sum/count ---
    printf("Reading numbers from input.txt...\n");
    while (fscanf(inputFile, "%d", &number) == 1) {
        sum += number;
        count++;
    }

    // --- 3. Close the input file ---
    fclose(inputFile);

    // --- 4. Calculate the average ---
    if (count > 0) {
        average = (double)sum / count;
        printf("Calculation successful. Sum: %d, Count: %d, Average: %.2f\n", sum, count, average);
    } else {
        printf("The input file was empty or contained no valid numbers.\n");
    }
    
    // --- 5. Open the output file for writing ---
    outputFile = fopen("output.txt", "w");
    if (outputFile == NULL) {
        perror("Error opening output.txt");
        return 1; // Exit with error code
    }

    // --- 6. Write the results to the output file ---
    if (count > 0) {
        fprintf(outputFile, "--- Results from Average Calculator ---\n");
        fprintf(outputFile, "Total count of numbers: %d\n", count);
        fprintf(outputFile, "Total sum of numbers: %d\n", sum);
        fprintf(outputFile, "Calculated average: %.2f\n", average);
        printf("Results written to output.txt successfully.\n");
    } else {
        fprintf(outputFile, "No valid numbers were found in the input file.\n");
    }

    // --- 7. Close the output file ---
    fclose(outputFile);

    return 0; // Exit successfully
}