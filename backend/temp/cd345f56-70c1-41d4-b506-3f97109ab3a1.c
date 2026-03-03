#include <stdio.h>
#include <stdlib.h>
#include <omp.h>

#define N 1000000 // Size of the array

int main() {
    int *array;
    long long total_sum = 0;
    int i;
    int num_threads;

    // Allocate memory for the array
    array = (int *)malloc(N * sizeof(int));
    if (array == NULL) {
        perror("Failed to allocate memory");
        return 1;
    }

    // Initialize the array with some values (e.g., i + 1)
    for (i = 0; i < N; i++) {
        array[i] = i + 1;
    }
    
    // --- OpenMP Parallel Region ---
    
    // Set up the parallel execution
    #pragma omp parallel private(i) shared(array)
    {
        // Get the total number of threads being used
        if (omp_get_thread_num() == 0) {
            num_threads = omp_get_num_threads();
            printf("Running with %d threads.\n", num_threads);
        }

        // Parallelize the loop using 'reduction' to safely calculate the sum.
        // The 'reduction(+:total_sum)' clause ensures that each thread has its 
        // own private copy of 'total_sum', and the compiler handles the 
        // synchronized summation of these private copies back into the 
        // global 'total_sum' after the loop finishes.
        #pragma omp for reduction(+:total_sum)
        for (i = 0; i < N; i++) {
            total_sum += array[i];
        }
    } // End of parallel region
    
    // --- Output and Cleanup ---
    
    // The expected sum for 1 to N is N*(N+1)/2. For N=1,000,000, this is 500,000,500,000.
    printf("\nTotal sum of the array elements (1 to %d) is: %lld\n", N, total_sum);
    
    // Free the allocated memory
    free(array);

    return 0;
}