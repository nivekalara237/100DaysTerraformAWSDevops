package com.nivekaa.gencode.infra.data.localstorage;

import com.nivekaa.gencode.core.interactors.FileInteractor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;

@Service
public class FileService implements FileInteractor {
  private @Value("${storage.main-dir}") String mainPath;

  private String getOrCreateMainPath() {
    File dir = new File(mainPath);
    if (dir.exists() && dir.isDirectory()) {
      return mainPath;
    }

    try {
      Path path = Files.createDirectory(Path.of(mainPath));
      return path.toString();
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  public File getFile(String path) {
    String dir = getOrCreateMainPath();
    String fullPath = path;
    if (!path.startsWith(dir)) {
      fullPath = dir.concat(path);
    }
    return new File(fullPath);
  }

  @Override
  public void writeNewLine(String path, String content) {
    File file = getFile(path);
    if (!file.exists()) {
      try {
        Files.writeString(file.toPath(), content);
      } catch (IOException e) {
        throw new RuntimeException(e);
      }
    } else {

      try {
        Files.writeString(file.toPath(), "\n".concat(content), StandardOpenOption.WRITE, StandardOpenOption.APPEND);
      } catch (IOException e) {
        throw new RuntimeException(e);
      }

    }
  }
}
