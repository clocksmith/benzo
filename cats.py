import os


def concatenate_sibling_files():
    """
    Concatenates all files (except itself and existing output) in the
    current directory into a single file named 'cats.txt',
    adding separators and comments.
    """

    output_filename = "cats.txt"
    separator = "-" * 80  # 80 hyphens

    script_name = os.path.basename(__file__)  # Get the name of this script

    with open(output_filename, "w") as outfile:
        for filename in os.listdir("."):  # List files in current directory
            if filename == script_name:  # Skip the script itself
                continue
            if filename == output_filename:  # Skip any existing output files
                continue

            filepath = filename  # Filepath is just the filename in current dir

            if os.path.isfile(filepath):  # Ensure it's a file
                outfile.write(separator + "\n")
                outfile.write(f"# File: {filename}\n")
                try:
                    with open(filepath, "r") as infile:
                        outfile.write(infile.read())
                except Exception as e:
                    outfile.write(f"# Error reading file: {filename} - {e}\n")

    print(f"Concatenated files from current directory to '{output_filename}'")


if __name__ == "__main__":
    concatenate_sibling_files()
