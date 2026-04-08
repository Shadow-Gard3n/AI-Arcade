import gensim.downloader as api

print("Loading model... this takes a minute on first run!")
# Downloads and caches a ~400MB GloVe model
model = api.load("glove-wiki-gigaword-100") 

# Test a similarity score
score = model.similarity('developer', 'programmer')
print(f"Similarity: {score}")