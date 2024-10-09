package com.nivekaa.gencode.core.interactors;

import java.io.File;

public interface FileInteractor {
  File getFile(String fullPath);

  void writeNewLine(String path, String content);
}
