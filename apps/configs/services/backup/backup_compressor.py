import zstandard as zstd
import gzip
import lz4.frame
from apps.configs.constants import CompressionAlgorithm
from apps.configs.exceptions import BackupError

class BackupCompressor:
    def compress(self, data, algorithm=None):
        if not algorithm:
            return data
        if algorithm == CompressionAlgorithm.ZSTD:
            compressor = zstd.ZstdCompressor(level=3)
            return compressor.compress(data)
        elif algorithm == CompressionAlgorithm.GZIP:
            return gzip.compress(data, compresslevel=6)
        elif algorithm == CompressionAlgorithm.LZ4:
            return lz4.frame.compress(data, compression_level=4)
        else:
            raise BackupError(f"Unknown compression algorithm {algorithm}")
    def decompress(self, data, algorithm):
        if not algorithm:
            return data
        if algorithm == CompressionAlgorithm.ZSTD:
            decompressor = zstd.ZstdDecompressor()
            return decompressor.decompress(data)
        elif algorithm == CompressionAlgorithm.GZIP:
            return gzip.decompress(data)
        elif algorithm == CompressionAlgorithm.LZ4:
            return lz4.frame.decompress(data)
        else:
            raise BackupError(f"Unknown compression algorithm {algorithm}")
    def get_compression_ratio(self, original, compressed):
        if original <= 0:
            return 0
        return (1 - (len(compressed) / original)) * 100