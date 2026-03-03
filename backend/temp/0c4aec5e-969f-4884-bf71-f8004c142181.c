#include <stdio.h>
#include <stdlib.h>
#include <mpi.h>

int main(int argc, char *argv[]) {
    int rank;       // The unique ID of the current process (0 to size-1)
    int size;       // The total number of processes launched

    // 1. Initialize the MPI execution environment
    MPI_Init(&argc, &argv);

    // 2. Get the rank of the calling process (its ID)
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);

    // 3. Get the total number of processes in the communicator
    MPI_Comm_size(MPI_COMM_WORLD, &size);

    // 4. Each process prints a unique message
    printf("Hello from process %d of %d!\n", rank, size);

    // 5. Finalize the MPI environment
    MPI_Finalize();

    return 0;
}