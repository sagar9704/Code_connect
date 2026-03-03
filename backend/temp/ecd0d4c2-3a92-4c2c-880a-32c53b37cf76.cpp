int main() {
    cout << "[cpp-start]\n";  // <-- debug marker

    vector<long long> arr;
    long long x;

    while (cin >> x) arr.push_back(x);

    if (arr.empty()) {
        cout << "No numbers\n";
        return 0;
    }

    merge_sort(arr);

    cout << "[cpp-output] ";
    for (size_t i = 0; i < arr.size(); i++) {
        if (i) cout << " ";
        cout << arr[i];
    }
    cout << "\n";

    cout << "[cpp-end]\n";
    return 0;
}
