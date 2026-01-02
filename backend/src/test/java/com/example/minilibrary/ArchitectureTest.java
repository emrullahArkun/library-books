package com.example.minilibrary;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

@AnalyzeClasses(packages = "com.example.minilibrary", importOptions = { ImportOption.DoNotIncludeTests.class })
public class ArchitectureTest {

    @ArchTest
    static final ArchRule controllers_should_not_access_repositories = noClasses().that()
            .resideInAPackage("..controller..")
            .should().dependOnClassesThat().resideInAPackage("..repository..");

    @ArchTest
    static final ArchRule services_should_be_annotated_with_Service = classes().that().resideInAPackage("..service..")
            .and().haveSimpleNameEndingWith("Service")
            .should().beAnnotatedWith(org.springframework.stereotype.Service.class);

    @ArchTest
    static final ArchRule controllers_should_be_annotated_with_RestController = classes().that()
            .resideInAPackage("..controller..")
            .and().haveSimpleNameEndingWith("Controller")
            .should().beAnnotatedWith(org.springframework.web.bind.annotation.RestController.class);
}
