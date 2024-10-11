package com.nivekaa.gencode.infra.data.localstorage;

import com.nivekaa.gencode.core.interactors.FileInteractor;
import com.nivekaa.gencode.core.interactors.LocalStorageInteractor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class LocalStorage implements LocalStorageInteractor {
  private final FileInteractor fileInteractor;
  @Override
  public void appendLine(String pathFile, String line) {
    fileInteractor.writeNewLine(pathFile, line);
  }
}
